<?php
/**
 * Plugin Name: Les Montagnettes - Analyse de séjour
 * Description: Endpoint REST sécurisé pour le module Elementor Les Montagnettes.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('montagnettes/v1', '/analyze', [
        'methods'             => 'POST',
        'callback'            => 'montagnettes_analyze_stay',
        'permission_callback' => '__return_true',
    ]);
});

function montagnettes_analyze_stay(WP_REST_Request $request)
{
    if (!defined('OPENAI_API_KEY') || !OPENAI_API_KEY) {
        return new WP_Error(
            'missing_api_key',
            'La clé OpenAI n’est pas configurée.',
            ['status' => 503]
        );
    }

    $ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $rate_key = 'mai_rate_' . md5($ip);
    $requests = (int) get_transient($rate_key);

    if ($requests >= 20) {
        return new WP_Error(
            'rate_limit',
            'Trop de demandes. Merci de réessayer dans quelques minutes.',
            ['status' => 429]
        );
    }

    set_transient($rate_key, $requests + 1, 10 * MINUTE_IN_SECONDS);

    $request_text = sanitize_textarea_field((string) $request->get_param('request'));
    $context = sanitize_key((string) $request->get_param('context'));
    $language = sanitize_key((string) $request->get_param('language'));

    if (mb_strlen($request_text) < 3 || mb_strlen($request_text) > 500) {
        return new WP_Error(
            'invalid_request',
            'La demande doit contenir entre 3 et 500 caractères.',
            ['status' => 400]
        );
    }

    if (!in_array($context, ['auto', 'business', 'leisure'], true)) {
        $context = 'auto';
    }

    if (!in_array($language, ['fr', 'en'], true)) {
        $language = 'fr';
    }

    $allowed_criteria = [
        'business', 'team', 'couple', 'family', 'friends', 'location',
        'budget', 'wifi', 'invoice', 'cancellation', 'late', 'parking',
        'breakfast', 'comfort', 'access', 'spa', 'view', 'ski', 'calm',
        'kitchen', 'kids', 'restaurant', 'premium',
    ];

    $instructions = <<<'PROMPT'
Tu analyses une demande de séjour hôtelier dans les Alpes.

Classe-la dans exactement un de ces trois profils :
- business : Damien, commercial/consultant pressé, ou Sophie, assistante réservant pour la direction et des collaborateurs.
- couple : escapade loisirs à deux, romantique ou bien-être, avec priorité au confort et au cadre.
- senior : Carlo, senior actif recherchant confort, clarté, fiabilité et accès facile.
- family : Claire et Thomas, famille CSP+ avec enfants recherchant praticité, confort et gain de temps.

Contraintes :
- Ne décide jamais à la place du client.
- N’invente pas de dates, de budget ou d’équipements absents de la demande.
- Retourne uniquement les critères pertinents parmi la liste autorisée.
- Si le contexte vaut business, privilégie business.
- Si le contexte vaut leisure, choisis senior ou family selon la demande.
- Le résumé doit être rassurant, concret et tenir en une seule phrase.
- Rédige le résumé dans la langue demandée, français ou anglais.
PROMPT;

    $payload = [
        'model'        => 'gpt-5.5',
        'reasoning'    => ['effort' => 'none'],
        'instructions' => $instructions,
        'input'        => wp_json_encode([
            'demande'           => $request_text,
            'contexte'          => $context,
            'langue'            => $language,
            'criteres_autorises'=> $allowed_criteria,
        ], JSON_UNESCAPED_UNICODE),
        'text' => [
            'verbosity' => 'low',
            'format' => [
                'type'   => 'json_schema',
                'name'   => 'stay_analysis',
                'strict' => true,
                'schema' => [
                    'type'                 => 'object',
                    'additionalProperties' => false,
                    'properties' => [
                        'persona' => [
                            'type' => 'string',
                            'enum' => ['business', 'couple', 'senior', 'family'],
                        ],
                        'criteria' => [
                            'type'     => 'array',
                            'minItems' => 2,
                            'maxItems' => 8,
                            'items'    => [
                                'type' => 'string',
                                'enum' => $allowed_criteria,
                            ],
                        ],
                        'summary' => [
                            'type'      => 'string',
                            'maxLength' => 220,
                        ],
                    ],
                    'required' => ['persona', 'criteria', 'summary'],
                ],
            ],
        ],
    ];

    $response = wp_remote_post('https://api.openai.com/v1/responses', [
        'timeout' => 20,
        'headers' => [
            'Authorization' => 'Bearer ' . OPENAI_API_KEY,
            'Content-Type'  => 'application/json',
        ],
        'body' => wp_json_encode($payload),
    ]);

    if (is_wp_error($response)) {
        return new WP_Error('openai_unavailable', $response->get_error_message(), ['status' => 502]);
    }

    $status = wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    if ($status < 200 || $status >= 300) {
        return new WP_Error(
            'openai_error',
            'Le service IA est temporairement indisponible.',
            ['status' => 502]
        );
    }

    $output_text = $body['output'][0]['content'][0]['text'] ?? '';
    $analysis = json_decode($output_text, true);

    if (
        !is_array($analysis) ||
        !isset($analysis['persona'], $analysis['criteria'], $analysis['summary'])
    ) {
        return new WP_Error(
            'invalid_ai_response',
            'La réponse IA est invalide.',
            ['status' => 502]
        );
    }

    $analysis['criteria'] = array_values(array_intersect(
        $analysis['criteria'],
        $allowed_criteria
    ));

    return rest_ensure_response($analysis);
}

<?php
// Verarbeitet das Kontaktformular von tharsei.de und leitet die Nachricht per E-Mail weiter.

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'method_not_allowed']);
    exit;
}

function clean_line($value) {
    $value = trim($value ?? '');
    // Verhindert Header-Injection: keine Zeilenumbrüche in Einzeilern zulassen.
    return str_replace(["\r", "\n"], ' ', $value);
}

$name     = clean_line($_POST['name'] ?? '');
$email    = clean_line($_POST['email'] ?? '');
$phone    = clean_line($_POST['phone'] ?? '');
$anliegen = clean_line($_POST['anliegen'] ?? '');
$message  = trim($_POST['message'] ?? '');
$honeypot = clean_line($_POST['website'] ?? '');

// Honeypot-Feld: für Menschen unsichtbar, wird aber oft von Spam-Bots ausgefüllt.
if ($honeypot !== '') {
    echo json_encode(['success' => true]);
    exit;
}

if ($name === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'invalid_input']);
    exit;
}

$to = 'info@tharsei.de, esther.sluiter@web.de';
$subject = '=?UTF-8?B?' . base64_encode('Neue Nachricht über das Kontaktformular: Tharsei') . '?=';

$body  = "Neue Nachricht über das Kontaktformular auf tharsei.de\n\n";
$body .= "Name: {$name}\n";
$body .= "E-Mail: {$email}\n";
if ($phone !== '') {
    $body .= "Telefon: {$phone}\n";
}
if ($anliegen !== '') {
    $body .= "Anliegen: {$anliegen}\n";
}
$body .= "\nNachricht:\n{$message}\n";

$headers   = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=utf-8';
$headers[] = 'From: Tharsei Kontaktformular <no-reply@tharsei.de>';
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';

$success = mail($to, $subject, $body, implode("\r\n", $headers));

if ($success) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'mail_failed']);
}

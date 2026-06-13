<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/vendor/phpmailer/src/Exception.php';
require __DIR__ . '/vendor/phpmailer/src/PHPMailer.php';
require __DIR__ . '/vendor/phpmailer/src/SMTP.php';

function respond(bool $ok, string $message, int $status = 200): void
{
    http_response_code($status);
    echo json_encode(
        ['ok' => $ok, 'message' => $message],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

function field(string $name, int $limit = 2000): string
{
    $value = trim((string)($_POST[$name] ?? ''));
    return function_exists('mb_substr')
        ? mb_substr($value, 0, $limit, 'UTF-8')
        : substr($value, 0, $limit);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Метод не поддерживается.', 405);
}

if (!is_file(__DIR__ . '/smtp-config.php')) {
    respond(false, 'SMTP-конфиг не найден.', 500);
}

$config = require __DIR__ . '/smtp-config.php';

$name = field('name', 120);
$email = field('email', 180);
$message = field('message', 4000);
$consent = isset($_POST['consent']) && $_POST['consent'] === 'on';
$website = field('website', 200);

if ($website !== '') {
    respond(true, 'Заявка отправлена.');
}

if ($name === '') {
    respond(false, 'Укажите ваше имя.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Укажите корректный E-mail.', 422);
}

if (!$consent) {
    respond(false, 'Подтвердите согласие на обработку персональных данных.', 422);
}

$safeName = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safeMessage = nl2br(htmlspecialchars($message !== '' ? $message : 'Не указано', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
$sentAt = date('d.m.Y H:i:s');

$htmlBody = <<<HTML
<h2>Новая заявка с сайта ЮК «Эгида»</h2>
<p><strong>Имя:</strong> {$safeName}</p>
<p><strong>E-mail:</strong> {$safeEmail}</p>
<p><strong>Сообщение:</strong><br>{$safeMessage}</p>
<p><strong>Дата отправки:</strong> {$sentAt}</p>
HTML;

$textBody = "Новая заявка с сайта ЮК «Эгида»\n\n"
    . "Имя: {$name}\n"
    . "E-mail: {$email}\n"
    . "Сообщение:\n" . ($message !== '' ? $message : 'Не указано') . "\n\n"
    . "Дата отправки: {$sentAt}";

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = (string)$config['host'];
    $mail->SMTPAuth = true;
    $mail->Username = (string)$config['username'];
    $mail->Password = (string)$config['password'];
    $mail->SMTPSecure = (string)$config['secure'];
    $mail->Port = (int)$config['port'];
    $mail->CharSet = 'UTF-8';

    $mail->setFrom((string)$config['from_email'], (string)$config['from_name']);
    $mail->addAddress((string)$config['to_email'], (string)$config['to_name']);
    $mail->addReplyTo($email, $name);

    $mail->isHTML(true);
    $mail->Subject = 'Новая заявка с сайта ЮК «Эгида»';
    $mail->Body = $htmlBody;
    $mail->AltBody = $textBody;

    $mail->send();
    respond(true, 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.');
} catch (Exception $exception) {
    error_log('Egida form mail error: ' . $mail->ErrorInfo . ' / ' . $exception->getMessage());
    respond(false, 'Не удалось отправить заявку. Попробуйте позже или напишите нам на почту.', 500);
}

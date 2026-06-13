# SMTP setup

1. Copy `smtp-config.example.php` to `smtp-config.php`.
2. Put real SMTP data into `smtp-config.php`.
3. Upload the project to PHP hosting with PHP 8+.
4. Open the site through the hosting domain, fill the consultation form, and submit it.

Example for port/security:

```php
'port' => 465,
'secure' => 'ssl',
```

or

```php
'port' => 587,
'secure' => 'tls',
```

Do not publish `smtp-config.php` to a public repository: it contains the SMTP password.

<?php
$senhas = [
    'yasmim@veleja.com' => 'gatinhos123',
    'cofrinhochurros@veleja.com' => 'Raisethevil67',
];

foreach ($senhas as $email => $senha) {
    $hash = password_hash($senha, PASSWORD_BCRYPT);
    echo "<pre>";
    echo "Email: $email\n";
    echo "Hash: $hash\n";
    echo "UPDATE admins SET senha_hash = '$hash' WHERE email = '$email';\n";
    echo "</pre>";
}
?>
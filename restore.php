<?php

if (PHP_OS != 'Linux') {
    echo "Backup could not be performed: incorrect server OS";
    exit(1);
}

//get selection
$selection = $_GET['selection'];

//if selection null, don't display. Currently inaccessible via ui, so it's commented out
/*
if (strlen(trim($selection)) == 0)
{
    echo "Can't restore nothing! Specify a backup.";
    exit(1);
}
*/

//if selected "latest"
if (strtolower($selection) == "latest")
{
    $selection = shell_exec("ls backups/*.db -t | head -1");
    $selection = str_replace("backups/", "" , $selection); //doesn't display folder name
    $selection = str_replace(".db", "" , $selection); //doesn't display .db
    $selection = trim($selection); //removes whitespace at front or back
}

$command = "cp backups/" . $selection . ".db data.db";
$output = null;
$code = null;
exec($command, $output, $code);
if (!$code)
    echo "Restored backup #" . $selection . "!";
else
{
    echo "Could not restore " . $selection . "! Try again with a different backup.";
    exit(1);
}

?>
<?php

if (PHP_OS != 'Linux') {
    echo "Backup could not be performed: incorrect server OS";
    exit(1);
}

//makes backups directory if it does not exist
shell_exec('mkdir -p backups');

//get counter
try { $counter = shell_exec("cat backups/counter.txt");}
catch(Exception $e) { $counter = -1;}

//increment counter
$newcounter = $counter + 1;

//delete old backups
$maxBackups = 20; //change this value as needed
$maxBackups = $maxBackups + 1; //account for counter.txt
if (shell_exec("ls backups | wc -l") >= $maxBackups) //if we're over the maximum number of backups
    shell_exec("rm \"backups/$(ls backups -t | tail -1)\""); //deletes oldest backup


//makes backup according to counter
shell_exec("cp data.db backups/" . $newcounter . ".db");

//update counter
shell_exec("echo " . $newcounter . " > backups/counter.txt");

//Tells whoever called this what happened
if (shell_exec("cat backups/" . $newcounter . ".db"))
    echo "Backed up!";
else
    echo "There was a problem backing up!";

?>
<?php

// Connect to SCE calendar database
try {
    $DBH = new PDO("sqlite:data.db");
    $DBH->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
    $DBH->exec('PRAGMA FOREIGN_KEYS=1;');
}
catch(PDOException $e) {
    echo $e->getMessage();
}

// Get data from query
$eventDateTime = $_GET['date'];
$eventName = $_GET['name'];

// prepare sql statement

try {
    $sql = 'DELETE FROM event WHERE EventDateTime = :EventDateTime AND EventName = :EventName';
    $stmt = $DBH->prepare($sql);
}
catch (PDOException $e){
    error_log($e->getMessage(),0);
}

// bind value
$stmt->bindValue(':EventDateTime', $eventDateTime);
$stmt->bindValue(':EventName', $eventName);

// execute sql
$stmt->execute();

// close database
$DBH = null;

?>
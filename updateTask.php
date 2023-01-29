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

$eventName = $_GET['eventName'];
if (!isset($eventName)); //error
$vendor = $_GET['vendor'];
$taskType = $_GET['taskType'];
$completed = $_GET['completed']; 


/*
   if($vendor = null){
        $sql = 'UPDATE task SET Completed = :Completed WHERE  
        EventName = :EventName 
        AND TaskType = :TaskType 
        '//AND TaskText = :TaskText'
        ;

        $stmt = $DBH->prepare($sql);

        //bind values
        $stmt->bindValue(':EventName', $eventName);
        //$stmt->bindValue(':Vendor', $vendor);
        $stmt->bindValue(':TaskType', $taskType);
        //$stmt->bindValue(':TaskText', $taskText);
        $stmt->bindValue(':Completed', $completed);
   }
    else{
        $sql = 'UPDATE task SET Completed = :Completed WHERE  
        EventName = :EventName 
        AND Vendor = :Vendor 
        AND TaskType = :TaskType 
        AND TaskText = :TaskText';

        $stmt = $DBH->prepare($sql);

        //bind values
        $stmt->bindValue(':EventName', $eventName);
        $stmt->bindValue(':Vendor', $vendor);
        $stmt->bindValue(':TaskType', $taskType);
        $stmt->bindValue(':TaskText', $taskText);
        $stmt->bindValue(':Completed', $completed);
    }
*/

if (empty($vendor)){
$sql = 'UPDATE task SET Completed = :Completed WHERE  
        EventName = :EventName 
        AND TaskType = :TaskType
        AND Vendor IS NULL'
        ;

        $stmt = $DBH->prepare($sql);

        //bind values
        $stmt->bindValue(':EventName', $eventName);
        //$stmt->bindValue(':Vendor', $vendor);
        $stmt->bindValue(':TaskType', $taskType);
        $stmt->bindValue(':Completed', $completed);
}
else{
    $sql = 'UPDATE task SET Completed = :Completed WHERE  
    EventName = :EventName 
    AND Vendor = :Vendor 
    AND TaskType = :TaskType';

    $stmt = $DBH->prepare($sql);

    //bind values
    $stmt->bindValue(':EventName', $eventName);
    $stmt->bindValue(':Vendor', $vendor);
    $stmt->bindValue(':TaskType', $taskType);
    $stmt->bindValue(':Completed', $completed);
}

/*
$sql = 'UPDATE task SET Completed = :Completed WHERE  
EventName = :EventName AND Vendor = :Vendor AND TaskType = :TaskType'; // AND TaskType = :TaskType AND TaskText = :TaskText'; 
  */  



   
    
    //execute sql
    $stmt->execute();

// close database
$DBH = null;

?>
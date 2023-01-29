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
$eventOriginalDateTime = $_GET['oriDate'];
$eventNewDateTime = $_GET['newDate'];
$eventNewStartTime = $_GET['newStartTime'];
$eventNewEndTime = $_GET['newEndTime'];
$eventName = $_GET['name'];
$eventType = $_GET['type'];
$eventClient = $_GET['client'];
$balancePaid = $_GET['balancePaid'];
$balanceDue = $_GET['balanceDue'];

if($balanceDue <= $balancePaid){
    $balanceCompleted = 'true';
}
else{
    $balanceCompleted = 'false';
}

$vendorCountTotal = $_GET['numVendorsTotal'];
if (!isset($vendorCount)) $vendorCount = 0;

//Vendor arrays
$vendorOldName = [];
$vendorNewName = [];
$vendorTypes = [];
$vendorContacts = [];
$vendorDeletionStatuses = [];

for ($v = 1; $v <= $vendorCountTotal; $v++) {
    if (isset($_GET['eventVendorOldName' . $v]) && $_GET['eventVendorOldName' . $v] != "")
    {
        array_push($vendorOldName, $_GET['eventVendorOldName' . $v]);
        array_push($vendorNewName, $_GET['eventVendorNewName' . $v]);
        array_push($vendorTypes, $_GET['eventVendorTypeSelect' . $v]);
        array_push($vendorContacts, $_GET['eventVendorContact' . $v]);
        array_push($vendorDeletionStatuses, $_GET['eventVendorDeletionStatus' . $v]);
    }
}




//Update Tasks
function UpdateTask($event_date, $event_name, $due_date, $display_date, $notif_type) {

    global $DBH;

    // prepare sql statement
    $sql = 'UPDATE task SET DueDate = :DueDate, DisplayDate = :DisplayDate WHERE date(EventDateTime) = date(:EventDateTime) AND TaskType = :TaskType';
    $stmt = $DBH->prepare($sql);

    //bind values
    $stmt->bindValue(':EventDateTime', $event_date);
    $stmt->bindValue(':TaskType', $notif_type);
    $stmt->bindValue(':DueDate', $due_date);
    $stmt->bindValue(':DisplayDate', $display_date);

    

    //execute sql
    $stmt->execute();
}

function Update60notif($event_date, $event_name) {
    
    //find the due date and when to display the notification
    $due_date = date("c", strtotime($event_date."-60 days")); // 60 days before event date
    $display_date= date("c", strtotime($due_date."-2 weeks")); // = 2 weeks before due date
    $neat_due_date = date("m-d-y", strtotime($event_date."-60 days")); // display user friendly date
    
    //send to insert function
    UpdateTask($event_date, $event_name, $due_date, $display_date, "Balance", NULL); //insert for balance due
    UpdateTask($event_date, $event_name, $due_date, $display_date, "Damage Deposit Fee", NULL); //insert for damage deposit fee
    UpdateTask($event_date, $event_name, $due_date, $display_date, "Police Officer Fee", NULL); //insert for police offcer fee
    
}

function Update30notif($event_date, $event_name){ 

    //find the due date and when to display the notification
    $due_date = date("c", strtotime($event_date."-30 days")); // 30 days before event date
    $display_date= date("c", strtotime($due_date."-2 weeks")); // = 2 weeks before due date
    $neat_due_date = date("m-d-y", strtotime($event_date."-30 days")); // display user friendly date

    //send to insert function
    UpdateTask($event_date, $event_name, $due_date, $display_date, "Agreement");
    UpdateTask($event_date, $event_name, $due_date, $display_date, "Insurance");
    

    //client insurance notifs
    UpdateTask($event_date, $event_name, $due_date, $display_date, "Client Insurance", NULL);
}

function AddVendorNotif($event_date, $event_name, $vendorNewName){ 

    //find the due date and when to display the notification
    $due_date = date("c", strtotime($event_date."-30 days")); // 30 days before event date
    $display_date= date("c", strtotime($due_date."-2 weeks")); // = 2 weeks before due date
    //$neat_due_date = date("m-d-y", strtotime($event_date."-30 days")); // display user friendly date


        //send to insert function
        InsertTask($event_date, $event_name, $due_date, $display_date, "Agreement", $vendorNewName
);
        InsertTask($event_date, $event_name, $due_date, $display_date, "Insurance", $vendorNewName
);
    

}

function Update14notif($event_date, $event_name){

    $due_date = date("c", strtotime($event_date."-2 weeks")); // 14 days before event date
    $display_date= date("c", strtotime($due_date."-2 weeks")); // = 2 weeks before due date
    $neat_due_date = date("m-d-y", strtotime($event_date."-14 days")); // display user friendly date

    //send to insert function
    UpdateTask($event_date, $event_name, $due_date, $display_date, "Floorplan", NULL); //insert for Floorplan
    UpdateTask($event_date, $event_name, $due_date, $display_date, "Timeline", NULL); //insert for timeline
}

function InsertTask($event_date, $event_name, $due_date, $display_date, $notif_type, $vendorNewName) {
    $complete = 0; //means false

    global $DBH;

    // prepare sql statement
    $sql = 'INSERT INTO task VALUES (:EventDateTime, :EventName, :Vendor, :TaskType, :DueDate, :DisplayDate, :Completed)';
    $stmt = $DBH->prepare($sql);

    //bind values
    $stmt->bindValue(':EventDateTime', $event_date);
    $stmt->bindValue(':EventName', $event_name);
    $stmt->bindValue(':Vendor', $vendorNewName); // $vendor Dr. Besmer
    $stmt->bindValue(':TaskType', $notif_type);
    $stmt->bindValue(':DueDate', $due_date);
    $stmt->bindValue(':DisplayDate', $display_date);
    $stmt->bindValue(':Completed', $complete);

    //execute sql
    $stmt->execute();
}


// prepare sql statement
try {
    $sql = 'UPDATE event SET EventDateTime = :EventNewDateTime, EventStartTime = :EventNewStartTime, EventEndTime = :EventNewEndTime, EventName = :EventName, EventType = :EventType, 
    BalancePaidInCents = :BalancePaid, BalanceDueInCents = :BalanceDue, EventClient = :EventClient WHERE date(EventDateTime) = date(:EventOriginalDateTime)';
    $stmt = $DBH->prepare($sql);
}
catch (PDOException $e){
    error_log($e->getMessage(),0);
}

// bind value
$stmt->bindValue(':EventOriginalDateTime', $eventOriginalDateTime);
$stmt->bindValue(':EventNewDateTime', $eventNewDateTime);
$stmt->bindValue(':EventNewStartTime', $eventNewStartTime);
$stmt->bindValue(':EventNewEndTime', $eventNewEndTime);
$stmt->bindValue(':EventName', $eventName);
$stmt->bindValue(':EventType', $eventType);
$stmt->bindValue(':EventClient', $eventClient);
$stmt->bindValue(':BalancePaid', $balancePaid);
$stmt->bindValue(':BalanceDue', $balanceDue);

// execute sql
$stmt->execute();

////////////////////////////////////////// This will update the balance complete if balance paid is more than or equal to balance due
// prepare sql statement
$sql = 'UPDATE task SET Completed = :Completed WHERE EventName = :EventName AND TaskType = :TaskType';
$stmt = $DBH->prepare($sql);

//bind values
$stmt->bindValue(':EventName', $eventName);
$stmt->bindValue(':TaskType', 'Balance');
$stmt->bindValue(':Completed', $balanceCompleted);

//execute sql
$stmt->execute();

for ($v = 0; $v < count($vendorOldName); $v++) {
    $sql = 'SELECT * FROM vendor WHERE Name=:Name';
    $stmt = $DBH->prepare($sql);
    $stmt->bindValue(':Name', $vendorOldName[$v]);
    $stmt->execute();

    // If old name doesn't exist, insert vendor row (using newName)
    if (!($stmt->fetch())) {
        $sql = 'INSERT INTO vendor VALUES (:Name, :Type, :ContactInfo)';
        $stmt = $DBH->prepare($sql);
        $stmt->bindValue(':Name', $vendorNewName[$v]);
        $stmt->bindValue(':Type', $vendorTypes[$v]); 
        $stmt->bindValue(':ContactInfo', $vendorContacts[$v]);
        $stmt->execute();
    }
    else {
        //update vendor row
        $sql = 'UPDATE vendor SET Name = :NewName, Type = :Type, ContactInfo = :ContactInfo WHERE Name = :OldName';
        $stmt = $DBH->prepare($sql);
        $stmt->bindValue(':NewName', $vendorNewName[$v]);
        $stmt->bindValue(':Type', $vendorTypes[$v]);
        $stmt->bindValue(':ContactInfo', $vendorContacts[$v]);
        $stmt->bindValue(':OldName', $vendorOldName[$v]);
        $stmt->execute();
    }


    //test if event_vendor exists already
    $sql = 'SELECT * FROM event_vendor WHERE EventDateTime = :EventDateTime AND EventName = :EventName AND Vendor = :Vendor';
    $stmt = $DBH->prepare($sql);
    $stmt->bindValue(':EventDateTime', $eventNewDateTime); //use new since it's been updated already
    $stmt->bindValue(':EventName', $eventName);
    $stmt->bindValue(':Vendor', $vendorNewName[$v]);
    $stmt->execute();
    if (!($stmt->fetch())) { //if not found
        
        //insert event_vendor row
        $sql = 'INSERT INTO event_vendor VALUES (:EventDateTime, :EventName, :Vendor)';
        $stmt = $DBH->prepare($sql);
        $stmt->bindValue(':EventDateTime', $eventNewDateTime);
        $stmt->bindValue(':EventName', $eventName);
        $stmt->bindValue(':Vendor', $vendorNewName[$v]);
        $stmt->execute();

        //add tasks
        AddVendorNotif($eventNewDateTime, $eventName, $vendorNewName[$v]);
    }

        //todo: delete event_vendor if marked to delete

        $str1 = $vendorDeletionStatuses[$v];
        $str2 = "true";
     
        if(strcmp($str1, $str2) == 0){
    
            $sql = 'DELETE FROM event_vendor WHERE Vendor = :Vendor';
            $stmt = $DBH->prepare($sql);
            $stmt->bindValue(':Vendor', $vendorOldName[$v]);
            $stmt->execute();

            $sql = 'DELETE FROM task WHERE Vendor = :Vendor AND EventDateTime = :EventDateTime';
            $stmt = $DBH->prepare($sql);
            $stmt->bindValue(':Vendor', $vendorOldName[$v]);
            $stmt->bindValue(':EventDateTime', $eventNewDateTime);
            $stmt->execute();
    
        }
    
}

////////////////////

Update60notif($eventNewDateTime, $eventName);
Update30notif($eventNewDateTime, $eventName); // "Dr. Besmer", "John Saint John"
Update14notif($eventNewDateTime, $eventName);

// close database
$DBH = null;

?>
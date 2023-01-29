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
//EventName and EventDateTime required; rest optional

$eventType = $_GET['eventType'];

$eventDateTime = $_GET['eventDateTime'];
if (!isset($eventDateTime)); //error
$eventName = $_GET['eventName'];
if (!isset($eventName)); //error

$eventClient = $_GET['eventClient'];
$eventStartTime = $_GET['eventStartTime']; if (!isset($eventStartTime)) $eventStartTime = null;
$eventEndTime = $_GET['eventEndTime']; if (!isset($eventEndTime)) $eventEndTime = null;
$balanceDueInCents = $_GET['balanceDueInCents']; if (!isset($balanceDueInCents)) $balanceDueInCents = 0;
$balancePaidInCents = $_GET['balancePaidInCents']; if (!isset($balancePaidInCents)) $balancePaidInCents = 0;

$vendorCount = $_GET['numVendors'];
if (!isset($vendorCount)) $vendorCount = 0;

//Vendor arrays
$vendors = [];
$vendorTypes = [];
$vendorContacts = [];

for ($v = 1; $v <= $vendorCount; $v++) {
    if (isset($_GET['eventVendor' . $v]) && $_GET['eventVendor' . $v] != "") {
        array_push($vendors, $_GET['eventVendor' . $v]);
        array_push($vendorTypes, $_GET['eventVendorType' . $v]);
        array_push($vendorContacts, $_GET['eventVendorContact' . $v]);
    }
}

function InsertTask($event_date, $event_name, $due_date, $display_date, $notif_type, $vendors) {
    $complete = 0; //means false

    global $DBH;

    // prepare sql statement
    $sql = 'INSERT INTO task VALUES (:EventDateTime, :EventName, :Vendor, :TaskType, :DueDate, :DisplayDate, :Completed)';
    $stmt = $DBH->prepare($sql);

    //bind values
    $stmt->bindValue(':EventDateTime', $event_date);
    $stmt->bindValue(':EventName', $event_name);
    $stmt->bindValue(':Vendor', $vendors); // $vendor Dr. Besmer
    $stmt->bindValue(':TaskType', $notif_type);
    $stmt->bindValue(':DueDate', $due_date);
    $stmt->bindValue(':DisplayDate', $display_date);
    $stmt->bindValue(':Completed', $complete);

    //execute sql
    $stmt->execute();
}

//creates the notifications of the 60 day due dates (displayed 2 weeks before)
//these are notifications for balance due, damage deposit, and police officer fee
function Create60notif($event_date, $event_name, $balance_due_in_cents) {

    //find the due date and when to display the notification
    $due_date = date("c", strtotime($event_date."-60 days")); // 60 days before event date
    $display_date= date("c", strtotime($due_date."-2 weeks")); // = 2 weeks before due date
    $neat_due_date = date("m-d-y", strtotime($event_date."-60 days")); // display user friendly date

    //send to insert function
    if (intval($balance_due_in_cents) > 0) {
        InsertTask($event_date, $event_name, $due_date, $display_date, "Balance", NULL); //insert for balance due
    }
    InsertTask($event_date, $event_name, $due_date, $display_date, "Damage Deposit Fee", NULL); //insert for damage deposit fee
    InsertTask($event_date, $event_name, $due_date, $display_date, "Police Officer Fee", NULL); //insert for police offcer fee

}

//creates the notifications of the 30 day due dates (displayed 2 weeks before)
//these are the vendor specific notifications and client insurance
function Create30notif($event_date, $event_name, array $vendors){

    //find the due date and when to display the notification
    $due_date = date("c", strtotime($event_date."-30 days")); // 30 days before event date
    $display_date= date("c", strtotime($due_date."-2 weeks")); // = 2 weeks before due date
    $neat_due_date = date("m-d-y", strtotime($event_date."-30 days")); // display user friendly date

    //find the length of array $vendors to run for loop
    $arr_count = count($vendors);

    for ($i = 0; $i < $arr_count; $i++) {

        //send to insert function
        InsertTask($event_date, $event_name, $due_date, $display_date, "Agreement", $vendors[$i]);
        InsertTask($event_date, $event_name, $due_date, $display_date, "Insurance", $vendors[$i]);
    }

    //client insurance notifs
    InsertTask($event_date, $event_name, $due_date, $display_date, "Client Insurance", NULL);
}

//creates the notifications of the 2 week due dates (displayed 2 weeks before)
//these are the notifications for flooplan and timeline
function Create14notif($event_date, $event_name){

    //find the due date and when to display the notification
    $due_date = date("c", strtotime($event_date."-2 weeks")); // 14 days before event date
    $display_date= date("c", strtotime($due_date."-2 weeks")); // = 2 weeks before due date
    $neat_due_date = date("m-d-y", strtotime($event_date."-14 days")); // display user friendly date

    //send to insert function
    InsertTask($event_date, $event_name, $due_date, $display_date, "Floorplan", NULL); //insert for Floorplan
    InsertTask($event_date, $event_name, $due_date, $display_date, "Timeline", NULL); //insert for timeline
}

// Validate input by checking if there's already an event on the same day
$sql = 'SELECT * FROM event WHERE EventDateTime=:EventDateTime';
$stmt = $DBH->prepare($sql);
$stmt->bindValue(':EventDateTime', $eventDateTime);
$stmt->execute();
if (!($row = $stmt->fetch())) {
    // prepare sql statement
    $sql = 'INSERT INTO event VALUES (:EventType, :EventDateTime, :EventName, :EventClient, :EventStartTime, :EventEndTime, :BalanceDueInCents, :BalancePaidInCents)';
    $stmt = $DBH->prepare($sql);

    //bind values
    $stmt->bindValue(':EventType', $eventType);
    $stmt->bindValue(':EventDateTime', $eventDateTime);
    $stmt->bindValue(':EventName', $eventName);
    $stmt->bindValue(':EventClient', $eventClient);
    $stmt->bindValue(':EventStartTime', $eventStartTime);
    $stmt->bindValue(':EventEndTime', $eventEndTime);
    $stmt->bindValue(':BalanceDueInCents', $balanceDueInCents);
    $stmt->bindValue(':BalancePaidInCents', $balancePaidInCents);

    //execute sql
    $stmt->execute();

    // add event_vendor (samples; this is not responsive to what the user input)
    /*$sql = 'INSERT INTO event_vendor VALUES (:EventDateTime, :EventName, :Vendor)';
    $stmt = $DBH->prepare($sql);
    $stmt->bindValue(':EventDateTime', $eventDateTime);
    $stmt->bindValue(':EventName', $eventName);
    $stmt->bindValue(':Vendor', "Dr. Besmer");
    $stmt->execute();
    $stmt->bindValue(':Vendor', "John Saint John");
    $stmt->execute();*/

    for ($v = 0; $v < count($vendors); $v++) {
        $sql = 'SELECT * FROM vendor WHERE Name=:Name';
        $stmt = $DBH->prepare($sql);
        $stmt->bindValue(':Name', $vendors[$v]);
        $stmt->execute();
        
        // Validate input by checking if there's already an event on the same day
        if (!($row = $stmt->fetch())) {
            $sql = 'INSERT INTO vendor VALUES (:Name, :Type, :ContactInfo)';
            $stmt = $DBH->prepare($sql);
            $stmt->bindValue(':Name', $vendors[$v]);
            $stmt->bindValue(':Type', $vendorTypes[$v]); // Not implemented yet
            $stmt->bindValue(':ContactInfo', $vendorContacts[$v]);
            $stmt->execute();
        }

        $sql = 'INSERT INTO event_vendor VALUES (:EventDateTime, :EventName, :Vendor)';
        $stmt = $DBH->prepare($sql);
        $stmt->bindValue(':EventDateTime', $eventDateTime);
        $stmt->bindValue(':EventName', $eventName);
        $stmt->bindValue(':Vendor', $vendors[$v]);
        $stmt->execute();
    }

    //create notifications and due dates
    Create60notif($eventDateTime, $eventName, $balanceDueInCents);
    Create30notif($eventDateTime, $eventName, $vendors); // "Dr. Besmer", "John Saint John"
    Create14notif($eventDateTime, $eventName);
}

// close database
$DBH = null;

?>
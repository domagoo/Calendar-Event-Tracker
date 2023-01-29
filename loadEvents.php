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

// Select data from database
$STH = $DBH->query('SELECT * FROM event');
$STH->setFetchMode(PDO::FETCH_ASSOC);

// Get and transmit data from SCE calendar database
?>
<?php 

echo '<events>';

while ($row = $STH->fetch()) {
    echo '<event>';

    echo '<eventDateTime>' . htmlspecialchars($row['EventDateTime']) . '</eventDateTime>';
    echo '<eventStartTime>' . htmlspecialchars($row['EventStartTime']) . '</eventStartTime>';
    echo '<eventEndTime>' . htmlspecialchars($row['EventEndTime']) . '</eventEndTime>';
    echo '<eventName>' . htmlspecialchars($row['EventName']) . '</eventName>';
    echo '<eventType>' . htmlspecialchars($row['EventType']) . '</eventType>';
    echo '<eventClient>' . htmlspecialchars($row['EventClient']) . '</eventClient>';
    echo '<balanceDueInCents>' . htmlspecialchars($row['BalanceDueInCents']) . '</balanceDueInCents>';
    echo '<balancePaidInCents>' . htmlspecialchars($row['BalancePaidInCents']) . '</balancePaidInCents>';

    echo '</event>';
}

echo '</events>';

?>



<?php
// Close database connection
$DBH = null;
?>
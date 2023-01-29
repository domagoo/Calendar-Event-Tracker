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
$STH = $DBH->query('SELECT * FROM event_vendor');
$STH->setFetchMode(PDO::FETCH_ASSOC);

// Get and transmit data from SCE calendar database
?>
<?php


echo '<eVendors>';


while ($row = $STH->fetch()) {
    echo '<eVendor>';

    echo '<eventDateTime>' . htmlspecialchars($row['EventDateTime']) . '</eventDateTime>';
    echo '<EventName>' . htmlspecialchars($row['EventName']) . '</EventName>';
    echo '<Vendor>' . htmlspecialchars($row['Vendor']) . '</Vendor>';
    
    echo '</eVendor>';
}

echo '</eVendors>';


?>



<?php
// Close database connection
$DBH = null;
?>
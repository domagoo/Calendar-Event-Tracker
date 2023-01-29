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
$STH = $DBH->query('SELECT * FROM vendor');
$STH->setFetchMode(PDO::FETCH_ASSOC);

// Get and transmit data from SCE calendar database
?>
<?php


echo '<Vendors>';


while ($row = $STH->fetch()) {
    echo '<vendor>';

    echo '<Name>' . htmlspecialchars($row['Name']) . '</Name>';
    echo '<Type>' . htmlspecialchars($row['Type']) . '</Type>';
    echo '<ContactInfo>' . htmlspecialchars($row['ContactInfo']) . '</ContactInfo>';
    
    echo '</vendor>';
}

echo '</Vendors>';


?>



<?php
// Close database connection
$DBH = null;
?>
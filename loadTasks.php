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
$STH = $DBH->query('SELECT * FROM task');
$STH->setFetchMode(PDO::FETCH_ASSOC);

// Get and transmit data from SCE calendar task database
?>
<?php 

echo '<tasks>';

while ($row = $STH->fetch()) {
    echo '<task>';

    echo '<eventDateTime>' . htmlspecialchars($row['EventDateTime']) . '</eventDateTime>';
    echo '<EventName>' . htmlspecialchars($row['EventName']) . '</EventName>';
    echo '<Vendor>' . htmlspecialchars($row['Vendor']) . '</Vendor>';
    echo '<TaskType>' . htmlspecialchars($row['TaskType']) . '</TaskType>';
    echo '<dueDate>' . htmlspecialchars($row['DueDate']) . '</dueDate>';
    echo '<DisplayDate>' . htmlspecialchars($row['DisplayDate']) . '</DisplayDate>';
    echo '<Completed>' . htmlspecialchars($row['Completed']) . '</Completed>';

    echo '</task>';
}

echo '</tasks>';

?>

<?php
// Close database connection
$DBH = null;
?>
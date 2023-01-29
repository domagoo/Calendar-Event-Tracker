/*
    To run this script, execute the following commands:
        sqlite3 data.db
        .read createDataDB.sql
    Then, to confirm that this worked, run the following command:
        .tables
    To close sqlite3:
        .exit
*/

/* Some data types are unintuitive. See System Management Document for explanation */

CREATE TABLE event (
    EventType TEXT,
    EventDateTime TEXT, /*See the following to handle dates: https://tableplus.com/blog/2018/07/sqlite-how-to-use-datetime-value.html*/
    EventName TEXT,
    EventClient TEXT,
    EventStartTime TEXT,
    EventEndTime TEXT,
    BalanceDueInCents INTEGER, /*Convert to standard currency as needed in code by dividing by 100 */
    BalancePaidInCents INTEGER, /*See above*/
    PRIMARY KEY (EventDateTime, EventName)
);

CREATE TABLE event_vendor (
    EventDateTime TEXT, /*See above notes for dates*/
    EventName TEXT,
    Vendor TEXT,
    PRIMARY KEY (EventDateTime, EventName, Vendor),
    FOREIGN KEY (EventDateTime, EventName) REFERENCES event(EventDateTime, EventName) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Vendor) REFERENCES vendor(Name) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE vendor (
    Name TEXT PRIMARY KEY,
    Type TEXT,
    ContactInfo TEXT
);

CREATE TABLE task (
    EventDateTime TEXT,
    EventName TEXT,
    Vendor TEXT,
    TaskType TEXT,
    DueDate TEXT,
    DisplayDate TEXT,
    Completed INTEGER, /* Boolean */
    FOREIGN KEY (EventDateTime, EventName) REFERENCES event(EventDateTime, EventName) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Vendor) REFERENCES vendor(Name) ON UPDATE CASCADE ON DELETE CASCADE
);
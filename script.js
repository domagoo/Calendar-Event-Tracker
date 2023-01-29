// Retrieve view-related variables from local storage

// Calendar view type
// 0 = weekly, 1 = monthly (default), 2 = yearly
if (localStorage.getItem('view') === null || (localStorage.getItem('view') != 0 && localStorage.getItem('view') != 1 && localStorage.getItem('view') != 2)) {
  localStorage.setItem('view', 1);  // Set default view
  localStorage.setItem('firstDay', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toDateString());  // Also set firstDay because it relies on view
}
let view = Number(localStorage.getItem('view'));

// For monthly view only (view = 1)
// 0 = show events (default), 1 = show due dates
if (localStorage.getItem('monthViewType') === null || (localStorage.getItem('monthViewType') != 0 && localStorage.getItem('monthViewType') != 1))
  localStorage.setItem('monthViewType', 0); // Set default monthly view type
let monthViewType = Number(localStorage.getItem('monthViewType'));

// First day of week, month, or year, according to current view (default is current week/month/year)
if (localStorage.getItem('firstDay') === null || !(new Date(localStorage.getItem('firstDay')) instanceof Date && !isNaN(new Date(localStorage.getItem('firstDay'))))) {
  // Set default firstDay
  if (view == 0)
    localStorage.setItem('firstDay', new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - new Date().getDay()).toDateString());
  else if (view == 1)
    localStorage.setItem('firstDay', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toDateString());
  else if (view == 2)
    localStorage.setItem('firstDay', new Date(new Date().getFullYear(), 0, 1).toDateString());
}
let firstDay = new Date(localStorage.getItem('firstDay'));

// Whether monthly notifications have been dismissed
// Stores month of last notification dismissal (-1 by default, meaning never dismissed)
if (localStorage.getItem('policeDismissed') === null || isNaN(localStorage.getItem('policeDismissed')) || localStorage.getItem('policeDismissed') < -1 || localStorage.getItem('policeDismissed') > 11)
  localStorage.setItem('policeDismissed', -1);  // Set default dismissal state
let policeDismissed = Number(localStorage.getItem('policeDismissed'));;
if (localStorage.getItem('cleaningStaffDismissed') === null || isNaN(localStorage.getItem('cleaningStaffDismissed')) || localStorage.getItem('cleaningStaffDismissed') < -1 || localStorage.getItem('cleaningStaffDismissed') > 11)
  localStorage.setItem('cleaningStaffDismissed', -1); // Set default dismissal state
let cleaningStaffDismissed = Number(localStorage.getItem('cleaningStaffDismissed'));;

let clicked = null;
let xmlEvents; // Used in loadEvents function
let xmlTasks; // Similar to XML Events, used in loadTasks function
let xmlVendors; // Similar to XML Function Prior
let xmlEventVendors; // Similar to XML Function Prior
let vendorCount = 0; // 
let vendorCountEdit; // Number of total vendors
let addVendorCount = 0;

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const viewEventModal = document.getElementById('viewEventModal');
const notifModal = document.getElementById('notifModal');
const notifModalNotifs = document.getElementById('notifModalNotifs');

const eventTitleInput = document.getElementById('eventTitleInput');
const eventDateInput = document.getElementById("eventDateInput");
const eventStartTimeInput = document.getElementById('eventStartTimeInput');
const eventEndTimeInput = document.getElementById('eventEndTimeInput');
const eventTypeInput = document.getElementById('eventTypeInput');
const eventClientInput = document.getElementById('eventClientInput');
const eventBalanceDueInput = document.getElementById('eventBalanceDueInput');

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// anim indicates animation to play on load (default is no animation)
function load(anim = 'none') {
  // Only show events or due dates option for monthly view
  if (view == 1) {
    for (let c of document.getElementsByClassName("monthlyViewTypeButton")) {
      c.style.visibility = "visible";
      c.style.opacity = "100%";
      // If page is loading, set monthlyViewTypeButton animation
      if (anim == 'appearDown 0.5s') {
        setTimeout(function () {
          for (e of document.getElementsByClassName("monthlyViewTypeButton")) {
            e.style.animation = anim;
            e.style.transition = '0.1s';
          }
        }, 1);
      }
    }
  }
  else {
    for (let c of document.getElementsByClassName("monthlyViewTypeButton")) {
      c.style.opacity = "0%";
      setTimeout(function () { c.style.visibility = "hidden"; }, 1);
    }
  }
  // Hide weekdays on yearly view
  if (view == 2) {
    for (let c of document.getElementsByClassName('weekdayLabel')) {
      c.style.opacity = "0%";
      setTimeout(function () { c.style.visibility = "hidden"; }, 1);
    }
  }
  else {
    for (let c of document.getElementsByClassName('weekdayLabel')) {
      c.style.visibility = "visible";
      c.style.opacity = "100%";
      // If page is loading, set weekdays animation
      if (anim == 'appearDown 0.5s') {
        setTimeout(function () {
          for (e of document.getElementsByClassName("weekdayLabel")) {
            e.style.animation = anim;
            e.style.transition = '0.1s';
          }
        }, 1);
      }
    }
  }

  // Weekly view
  if (view == 0) {
    const lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + 6); // Last day of week
    const daysInMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate(); // Returns number of days in month as integer between 1 and 31

    // Display week with two years (ex: Dec 27, 2020-Jan 2, 2021)
    if (firstDay.getFullYear() != lastDay.getFullYear())
      document.getElementById('monthDisplay').innerText =
        `${firstDay.toLocaleDateString('en-us', { month: 'short', day: 'numeric' })}, ${firstDay.getFullYear()}-${lastDay.toLocaleDateString('en-us', { month: 'short', day: 'numeric' })}, ${lastDay.getFullYear()}`;
    // Display week with two month names (ex: Mar 27-Apr 2, 2022)
    else if (firstDay.getMonth() != lastDay.getMonth())
      document.getElementById('monthDisplay').innerText =
        `${firstDay.toLocaleDateString('en-us', { month: 'short', day: 'numeric' })}-${lastDay.toLocaleDateString('en-us', { month: 'short', day: 'numeric' })}, ${firstDay.getFullYear()}`;
    // Display week with one month name (ex: Mar 20-26, 2022)
    else
      document.getElementById('monthDisplay').innerText =
        `${firstDay.toLocaleDateString('en-us', { month: 'short', day: 'numeric' })}-${lastDay.toLocaleDateString('en-us', { day: 'numeric' })}, ${firstDay.getFullYear()}`;

    calendar.innerHTML = '';

    // Row 1 is events row, row 2 is due dates row
    for (let row = 1; row <= 2; row++) {
      // Put date boxes on calendar
      for (let i = firstDay.getDate(); i <= firstDay.getDate() + 6; i++) {
        // Add event boxes
        const daySquare = document.createElement('div');
        daySquare.classList.add('day');
        document.getElementById('monthDisplay').style.animation = 'none';
        daySquare.style.animation = anim;
        setTimeout(function () {
          if (anim != 'appearUp 0.25s')
            document.getElementById('monthDisplay').style.animation = anim;
        }, 1);
        const thisDate = new Date(firstDay.getFullYear(), firstDay.getMonth() + (i > daysInMonth), ((i - 1) % daysInMonth) + 1); // Stores this date as a JS object

        if (row == 1) {
          daySquare.classList.add('weeklyEvent');
          const eventForDay = getEvent(thisDate); // Find event for this day
          daySquare.innerText = ((i - 1) % daysInMonth) + 1;
          // Mark today
          if (((i - 1) % daysInMonth) + 1 === new Date().getDate() && (
            (thisDate.getMonth() == new Date().getMonth() && thisDate.getFullYear() == new Date().getFullYear()) ||
            (lastDay.getMonth() == new Date().getMonth() && lastDay.getFullYear() == new Date().getFullYear())))
            daySquare.id = 'currentDay';

          if (eventForDay) { // Add preview box for day
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.innerText = eventForDay.getElementsByTagName("eventName")[0].innerHTML;
            daySquare.appendChild(eventDiv);
          }
          daySquare.addEventListener('click', () => openModal(thisDate)); // Listens to see if box is opened, passes day to openModal() if so
        }
        else {
          daySquare.classList.add('weeklyDueDate');
          const thisDayTasks = getTasks(0, thisDate); // Find task for this day
          daySquare.innerText = "Due Date";

          let vendorInsuranceNum = 0;
          let vendorAgreementNum = 0;
          var eventNameArray = [];
          var eventNameSet = new Set();

          if (thisDayTasks) { // Add preview box for day

            for (let i = 0; i < thisDayTasks.length; i++)
              eventNameArray.push(thisDayTasks[i].getElementsByTagName("EventName")[0].innerHTML);
            eventNameArray.map(arrElement => eventNameSet.add(arrElement));
            if (eventNameSet.size < 2) {
              const dueDateDiv = document.createElement('div');
              dueDateDiv.classList.add('dueDate');
              // Display the number of task that should show up for this day
              dueDateDiv.innerHTML += `${thisDayTasks.length}  tasks due for ` + thisDayTasks[0].getElementsByTagName("EventName")[0].innerHTML + ':';

              var ul = document.createElement("ul");
              ul.style.paddingLeft = "20px";

              // This for loop will post each task to the day for the number of tasks
              for (let j = 0; j < thisDayTasks.length; j++) {

                if (thisDayTasks[j].getElementsByTagName("TaskType")[0].innerHTML === "Insurance")
                  vendorInsuranceNum++;
                else if (thisDayTasks[j].getElementsByTagName("TaskType")[0].innerHTML === "Agreement")
                  vendorAgreementNum++;
                else {
                  var li = document.createElement("li");
                  li.appendChild(document.createTextNode(thisDayTasks[j].getElementsByTagName("TaskType")[0].innerHTML));
                  ul.appendChild(li);
                }

              }

              if (vendorInsuranceNum > 0) {
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(vendorAgreementNum + " Insurance"));
                ul.appendChild(li);
              }

              if (vendorAgreementNum > 0) {
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(vendorAgreementNum + " Agreement"));
                ul.appendChild(li);
              }

              dueDateDiv.appendChild(ul);

              let dateOfDueDateEvent = new Date(thisDayTasks[0].getElementsByTagName('eventDateTime')[0].innerHTML);
              daySquare.addEventListener('click', () => openModal(dateOfDueDateEvent)); // Listens to see if box is opened, passes day to openModal() if so
              daySquare.appendChild(dueDateDiv);
            } else {
              eventNameSet.forEach(item => {
                vendorInsuranceNum = 0;
                vendorAgreementNum = 0;

                let taskNum = 0;

                for (let i = 0; i < thisDayTasks.length; i++) {
                  if (item === thisDayTasks[i].getElementsByTagName("EventName")[0].innerHTML) {
                    taskNum++;
                  }
                }

                const dueDateDiv = document.createElement('div');
                dueDateDiv.classList.add('dueDate');
                // Display the number of task that should show up for this day
                dueDateDiv.innerHTML += `${taskNum}  tasks due for ` + item;
                daySquare.appendChild(dueDateDiv);

              });
            }
          }

          else
            daySquare.addEventListener('click', () => closeModal()); // Listens to see if empty box is opened, goes back to notification sidebar if so
        }
        calendar.appendChild(daySquare);
      }
    }
  }
  // Monthly view
  else if (view == 1) {
    const daysInMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate(); // Returns number of days in month as integer between 1 and 31

    // Display month and year (ex: March 2022)
    document.getElementById('monthDisplay').innerText =
      `${firstDay.toLocaleDateString('en-us', { month: 'long' })} ${firstDay.getFullYear()}`;

    calendar.innerHTML = '';

    // Put date boxes on calendar
    for (let i = 1; i <= firstDay.getDay() + daysInMonth; i++) {
      const daySquare = document.createElement('div');
      daySquare.classList.add('day');
      document.getElementById('monthDisplay').style.animation = 'none';
      daySquare.style.animation = anim;
      setTimeout(function () {
        if (anim != 'appearUp 0.25s')
          document.getElementById('monthDisplay').style.animation = anim;
      }, 1);
      const thisDate = new Date(firstDay.getFullYear(), firstDay.getMonth(), i - firstDay.getDay()); // Stores this date as a JS object

      if (i > firstDay.getDay()) {  // If date is part of the month
        daySquare.innerText = i - firstDay.getDay();

        // Mark today
        if (i - firstDay.getDay() === new Date().getDate() && thisDate.getMonth() == new Date().getMonth() && thisDate.getFullYear() == new Date().getFullYear())
          daySquare.id = 'currentDay';

        // Show events (default)
        if (monthViewType === 0) {
          const eventForDay = getEvent(thisDate); // Find event for this day
          if (eventForDay) { // Add preview box for day
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.classList.add('monthly');
            eventDiv.innerText = eventForDay.getElementsByTagName("eventName")[0].innerHTML;
            daySquare.appendChild(eventDiv);
          }
          daySquare.addEventListener('click', () => openModal(thisDate)); // Listens to see if box is opened, passes day to openModal() if so
        }
        // Show due dates
        else {

          const thisDayTasks = getTasks(0, thisDate); // Find task for this day

          var eventNameArray = [];
          var eventNameSet = new Set();

          if (thisDayTasks) { // Add preview box for day

            for (let i = 0; i < thisDayTasks.length; i++)
              eventNameArray.push(thisDayTasks[i].getElementsByTagName("EventName")[0].innerHTML);
            eventNameArray.map(arrElement => eventNameSet.add(arrElement));

            if (eventNameSet.size < 2) {
              // Make day box for the due dates
              const dueDateDiv = document.createElement('div');
              dueDateDiv.classList.add('dueDate');
              dueDateDiv.classList.add('monthly');

              // Display the number of tasks that should show up for this day
              dueDateDiv.innerHTML += `(${thisDayTasks.length})  tasks due for ` + thisDayTasks[0].getElementsByTagName("EventName")[0].innerHTML + '';
              let dateOfDueDateEvent = new Date(thisDayTasks[0].getElementsByTagName('eventDateTime')[0].innerHTML);
              daySquare.addEventListener('click', () => openModal(dateOfDueDateEvent)); // Listens to see if box is opened, passes day to openModal() if so
              daySquare.appendChild(dueDateDiv);
            }
            else {

              eventNameSet.forEach(item => {
                let taskNum = 0;

                for (let i = 0; i < thisDayTasks.length; i++) {
                  if (item === thisDayTasks[i].getElementsByTagName("EventName")[0].innerHTML) {
                    taskNum++;
                  }
                }

                // Make day box for the due dates
                const dueDateDiv = document.createElement('div');
                dueDateDiv.classList.add('dueDate');
                dueDateDiv.classList.add('monthly');

                // Display the number of tasks that should show up for this day
                dueDateDiv.innerHTML += `(${taskNum}) ` + item;
                let dateOfDueDateEvent = new Date(thisDayTasks[0].getElementsByTagName('eventDateTime')[0].innerHTML);
                daySquare.addEventListener('click', () => openModal(dateOfDueDateEvent)); // Listens to see if box is opened, passes day to openModal() if so
                daySquare.appendChild(dueDateDiv);

              });

            }

          }
          else
            daySquare.addEventListener('click', () => closeModal()); // Listens to see if empty box is opened, goes back to notification sidebar if so
        }
      }
      else {
        daySquare.classList.add('padding');
      }
      calendar.appendChild(daySquare);

    }
  }
  // Yearly view
  else if (view == 2) {
    // Display year (ex: 2022)
    document.getElementById('monthDisplay').innerText = firstDay.getFullYear();

    calendar.innerHTML = '';

    // Put month boxes on calendar
    for (let i = 0; i <= 11; i++) {
      const monthSquare = document.createElement('div');
      monthSquare.classList.add('day', 'month');
      document.getElementById('monthDisplay').style.animation = 'none';
      monthSquare.style.animation = anim;
      setTimeout(function () {
        if (anim != 'appearUp 0.25s')
          document.getElementById('monthDisplay').style.animation = anim;
      }, 1);
      monthSquare.innerText = months[i];

      // Mark current month
      if (i === new Date().getMonth() && firstDay.getFullYear() == new Date().getFullYear())
        monthSquare.id = 'currentDay';

      // Count number of events in month
      let numEvents = 0;
      const daysInMonth = new Date(firstDay.getFullYear(), i + 1, 0).getDate(); // Returns number of days in month as integer between 1 and 31
      firstDay.setMonth(i);
      for (j = 1; j <= daysInMonth; j++) {
        firstDay.setDate(j);
        // If there's an event for this day, count it
        if (getEvent(firstDay))
          numEvents++;
      }
      firstDay.setDate(1);
      if (numEvents > 0) { // Add preview box for month
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event');
        if (numEvents == 1)
          eventDiv.innerText = `1 event`;
        else
          eventDiv.innerText = `${numEvents} events`;
        monthSquare.appendChild(eventDiv);
      }

      monthSquare.addEventListener('click', function () {
        firstDay.setMonth(i); // Select appropriate month
        view = 1; // Set view to monthly
        // Update classes, then reload calendar
        document.getElementsByClassName("selectedView")[0].classList.remove("selectedView");
        document.getElementById('monthlyButton').classList.add("selectedView");
        load('appearUp 0.25s');
      }); // Listens to see if box is opened, opens relevant month in monthly view if so
      calendar.appendChild(monthSquare);
    }
    firstDay.setMonth(0);
  }

  // Function to ensure appropriate controls are selected
  checkSelectedControls();
  // Save view-related variables to local storage
  localStorage.setItem('firstDay', firstDay);
  localStorage.setItem('view', view);
  localStorage.setItem('monthViewType', monthViewType);
}

// Generates vendor fields automatically when Add Vendor button is pressed
function addVendor() {
  vendorCount++;
  
 
  const eventVendorDiv = document.getElementById('eventVendorDiv');


  // Vendor name input
  const vendorNameP = document.createElement('p');
  const vendorNameLabel = document.createElement('label');
  vendorNameLabel.innerText = `Vendor ${vendorCount}:`;
  const vendorNameInput = document.createElement('input');
  vendorNameInput.id = `eventVendorName${vendorCount}`;
  vendorNameInput.placeholder = "Vendor Name";
  vendorNameLabel.appendChild(vendorNameInput);
  vendorNameP.appendChild(vendorNameLabel);
  eventVendorDiv.appendChild(vendorNameP);

  // Vendor type dropdown
  const vendorTypeP = document.createElement('p');
  const vendorTypeLabel = document.createElement('label');
  vendorTypeLabel.innerText = "Vendor Type:";
  const vendorTypeSelect = document.createElement('select');
  vendorTypeSelect.id = `eventVendorTypeSelect${vendorCount}`;
  const vendorTypeBartender = document.createElement('option');
  vendorTypeBartender.innerText = "Bartender";
  vendorTypeBartender.value = "Bartender";
  vendorTypeSelect.appendChild(vendorTypeBartender);
  const vendorTypeCaterer = document.createElement('option');
  vendorTypeCaterer.innerHTML = "Caterer";
  vendorTypeCaterer.value = "Caterer";
  vendorTypeSelect.appendChild(vendorTypeCaterer);
  const vendorTypeDJ = document.createElement('option');
  vendorTypeDJ.innerHTML = "DJ";
  vendorTypeDJ.value = "DJ";
  vendorTypeSelect.appendChild(vendorTypeDJ);
  const vendorTypePlanner = document.createElement('option');
  vendorTypePlanner.innerHTML = "Planner";
  vendorTypePlanner.value = "Planner";
  vendorTypeSelect.appendChild(vendorTypePlanner);
  const vendorTypeOther = document.createElement('option');
  vendorTypeOther.innerHTML = "Other";
  vendorTypeOther.value = "Other";
  vendorTypeSelect.appendChild(vendorTypeOther);
  // Set default vendor (cycles between caterer, DJ, planner, and bartender)
  vendorTypeSelect.selectedIndex = vendorCount % 4;
  vendorTypeLabel.appendChild(vendorTypeSelect);
  vendorTypeP.appendChild(vendorTypeLabel);
  eventVendorDiv.appendChild(vendorTypeP);

  // Vendor type input (for custom vendor types)
  const vendorTypeOtherP = document.createElement('p');
  const vendorTypeOtherLabel = document.createElement('label');
  vendorTypeOtherLabel.innerText = "Other:";
  const vendorTypeOtherInput = document.createElement('input');
  vendorTypeOtherInput.id = `eventVendorTypeInput${vendorCount}`;
  vendorTypeOtherInput.placeholder = "Vendor Type";
  vendorTypeOtherLabel.appendChild(vendorTypeOtherInput);
  vendorTypeOtherP.appendChild(vendorTypeOtherLabel);
  vendorTypeOtherP.style.display = "none";
  vendorTypeSelect.onchange = () => {
    if (vendorTypeSelect.selectedIndex == 4)
      vendorTypeOtherP.style.display = "";
    else
      vendorTypeOtherP.style.display = "none";
  };
  eventVendorDiv.appendChild(vendorTypeOtherP);

  // Vendor contact input
  const vendorContactP = document.createElement('p');
  const vendorContactLabel = document.createElement('label');
  vendorContactLabel.innerText = "Contact:";
  const vendorContactInput = document.createElement('input');
  vendorContactInput.id = `eventVendorContact${vendorCount}`;
  vendorContactInput.placeholder = "Vendor Contact";
  vendorContactLabel.appendChild(vendorContactInput);
  vendorContactP.appendChild(vendorContactLabel);
  eventVendorDiv.appendChild(vendorContactP);
}

// Generates vendor fields automatically when Add Vendor button is pressed
function addVendorEdit() {
  vendorCountEdit++;
  addVendorCount += 1; // this counts the vendors added (after existing vendors)
 
  const eventVendorDiv = document.getElementById('viewEventVendorDiv');


  // Vendor name input
  const vendorNameP = document.createElement('p');
  const vendorNameLabel = document.createElement('label');
  vendorNameLabel.innerText = `Vendor ${vendorCountEdit}:`;
  const vendorNameInput = document.createElement('input');
  vendorNameInput.id = `viewVendorNewName${vendorCountEdit}`;
  vendorNameInput.dataset.newvendor = `true`;
  vendorNameInput.placeholder = "Vendor Name";
  vendorNameLabel.appendChild(vendorNameInput);
  vendorNameP.appendChild(vendorNameLabel);
  eventVendorDiv.appendChild(vendorNameP);

  // Vendor type dropdown
  const vendorTypeP = document.createElement('p');
  const vendorTypeLabel = document.createElement('label');
  vendorTypeLabel.innerText = "Vendor Type:";
  const vendorTypeSelect = document.createElement('select');
  vendorTypeSelect.id = `eventVendorTypeSelect${vendorCountEdit}`;
  const vendorTypeBartender = document.createElement('option');
  vendorTypeBartender.innerText = "Bartender";
  vendorTypeBartender.value = "Bartender";
  vendorTypeSelect.appendChild(vendorTypeBartender);
  const vendorTypeCaterer = document.createElement('option');
  vendorTypeCaterer.innerHTML = "Caterer";
  vendorTypeCaterer.value = "Caterer";
  vendorTypeSelect.appendChild(vendorTypeCaterer);
  const vendorTypeDJ = document.createElement('option');
  vendorTypeDJ.innerHTML = "DJ";
  vendorTypeDJ.value = "DJ";
  vendorTypeSelect.appendChild(vendorTypeDJ);
  const vendorTypePlanner = document.createElement('option');
  vendorTypePlanner.innerHTML = "Planner";
  vendorTypePlanner.value = "Planner";
  vendorTypeSelect.appendChild(vendorTypePlanner);
  const vendorTypeOther = document.createElement('option');
  vendorTypeOther.innerHTML = "Other";
  vendorTypeOther.value = "Other";
  vendorTypeSelect.appendChild(vendorTypeOther);
  // Set default vendor (cycles between caterer, DJ, planner, and bartender)
  vendorTypeSelect.selectedIndex = vendorCountEdit % 4;
  vendorTypeLabel.appendChild(vendorTypeSelect);
  vendorTypeP.appendChild(vendorTypeLabel);
  eventVendorDiv.appendChild(vendorTypeP);

  // Vendor type input (for custom vendor types)
  const vendorTypeOtherP = document.createElement('p');
  const vendorTypeOtherLabel = document.createElement('label');
  vendorTypeOtherLabel.innerText = "Other:";
  const vendorTypeOtherInput = document.createElement('input');
  vendorTypeOtherInput.id = `eventVendorTypeInput${vendorCountEdit}`;
  vendorTypeOtherInput.placeholder = "Vendor Type";
  vendorTypeOtherLabel.appendChild(vendorTypeOtherInput);
  vendorTypeOtherP.appendChild(vendorTypeOtherLabel);
  vendorTypeOtherP.style.display = "none";
  vendorTypeSelect.onchange = () => {
    if (vendorTypeSelect.selectedIndex == 4)
      vendorTypeOtherP.style.display = "";
    else
      vendorTypeOtherP.style.display = "none";
  };
  eventVendorDiv.appendChild(vendorTypeOtherP);

  // Vendor contact input
  const vendorContactP = document.createElement('p');
  const vendorContactLabel = document.createElement('label');
  vendorContactLabel.innerText = "Contact:";
  const vendorContactInput = document.createElement('input');
  vendorContactInput.id = `viewVendorContact${vendorCountEdit}`;
  vendorContactInput.placeholder = "Vendor Contact";
  vendorContactLabel.appendChild(vendorContactInput);
  vendorContactP.appendChild(vendorContactLabel);
  eventVendorDiv.appendChild(vendorContactP);
}

function openModal(thisDate) {
  // Reset error states
  eventTitleInput.classList.remove('error');
  document.getElementById('viewEventTitleInput').classList.remove('error');
  eventDateInput.classList.remove('error');
  viewEventDateInput.classList.remove('error');

  clicked = thisDate;
  clicked.setUTCHours(6, 0, 0);

  // Get event from events
  const eventForDay = getEvent(thisDate);

  // Check vendors for the day (event)
  const eventVendorsForDay = getEventVendors(thisDate);
  // Allows new vendors being added in event details to start at the number after existing event vendors. 
  // So if 4 event vendors exist, next event vendor would be vendor 4
  if (eventVendorsForDay.length > 0){
  vendorCountEdit = eventVendorsForDay.length;
  }
  else{
    vendorCountEdit = 0;
  }

  if (eventForDay) {
    // Get data to load into view
    let viewEventName = eventForDay.getElementsByTagName("eventName")[0].innerHTML;
    let viewEventStartTime = eventForDay.getElementsByTagName("eventStartTime")[0].innerHTML;
    let viewEventEndTime = eventForDay.getElementsByTagName("eventEndTime")[0].innerHTML;
    let viewEventType = eventForDay.getElementsByTagName("eventType")[0].innerHTML;
    let viewEventClient = eventForDay.getElementsByTagName("eventClient")[0].innerHTML;
    let viewBalanceDue = eventForDay.getElementsByTagName("balanceDueInCents")[0].innerHTML / 100;
    let viewBalancePaid = eventForDay.getElementsByTagName("balancePaidInCents")[0].innerHTML / 100;

    // Display data
    document.getElementById('viewEventTitleInput').value = viewEventName;
    document.getElementById('viewEventDateInput').value = thisDate.getFullYear() + '-' + (thisDate.getMonth() + 1).toString().padStart(2, '0') + '-' + thisDate.getDate().toString().padStart(2, '0');
    document.getElementById('viewEventStartTimeInput').value = viewEventStartTime;
    document.getElementById('viewEventEndTimeInput').value = viewEventEndTime;
    document.getElementById('viewEventTypeInput').value = viewEventType;
    document.getElementById('viewEventClientInput').value = viewEventClient;
    document.getElementById('viewBalanceDue').value = viewBalanceDue;
    document.getElementById('viewBalancePaid').value = viewBalancePaid;

    // Remove old vendor fields
    const viewVendorDiv = document.getElementById('viewVendorDiv');
    const viewEventVendorDiv = document.getElementById('viewEventVendorDiv');
    while (viewVendorDiv.lastChild)
      viewVendorDiv.removeChild(viewVendorDiv.lastChild);
    while (viewEventVendorDiv.lastChild)
    viewEventVendorDiv.removeChild(viewEventVendorDiv.lastChild);

    // Add new vendor fields
    for (let v = 1; v <= getEventVendors(clicked).length; v++) {


      const vendorNameTitle = document.createElement('p');
      vendorNameTitle.innerText = getEventVendors(clicked)[v - 1].getElementsByTagName("Vendor")[0].innerHTML;
      vendorNameTitle.id = `viewVendorOldName${v}`;
      vendorNameTitle.dataset.deletion = 'false';
      vendorNameTitle.classList.add('vendorNameTitle');
      vendorNameTitle.addEventListener('click', () => openVendor(v)); 

      const openOnClick = document.createElement('div');
      openOnClick.id = `openOnClickVendor${v}:`;
      openOnClick.classList.add('openOnClickDiv');
      openOnClick.style.display = 'none';
      let btn = document.createElement("button");
      btn.classList.add("deleteVendorButton", "redButton");
      btn.addEventListener('click', () => removeVendor(v));
      //btn.addEventListener('click', () => closeModal());
      btn.innerHTML = "Delete Vendor";

      // Vendor name input
      const vendorNameP = document.createElement('p');
      const vendorNameLabel = document.createElement('label');
      vendorNameLabel.innerText = `Vendor ${v}:`;
      const vendorNameInput = document.createElement('input');
      vendorNameInput.id = `viewVendorNewName${v}`;
      vendorNameInput.dataset.newvendor = `false`;
      let viewEventVendorName = getEventVendors(clicked)[v - 1].getElementsByTagName("Vendor")[0].innerHTML;
      vendorNameInput.value = viewEventVendorName;
      vendorNameInput.readOnly = false;
      vendorNameLabel.appendChild(vendorNameInput);
      vendorNameP.appendChild(vendorNameLabel);

      openOnClick.appendChild(btn);
      openOnClick.appendChild(vendorNameP);

      viewVendorDiv.appendChild(vendorNameTitle);
      viewVendorDiv.appendChild(openOnClick);

      // Vendor type dropdown
      const vendorTypeP = document.createElement('p');
      const vendorTypeLabel = document.createElement('label');
      vendorTypeLabel.innerText = "Vendor Type:";
      const vendorTypeInput = document.createElement('input');
      vendorTypeInput.id = `eventVendorTypeSelect${v}`;
      let vendorInfo = getVendor(viewEventVendorName);
      vendorTypeInput.value = vendorInfo.getElementsByTagName("Type")[0].innerHTML;
      vendorTypeInput.readOnly = false;
      vendorTypeLabel.appendChild(vendorTypeInput);
      vendorTypeP.appendChild(vendorTypeLabel);
      openOnClick.appendChild(vendorTypeP);
      viewVendorDiv.appendChild(openOnClick);

      // Vendor contact input
      const vendorContactP = document.createElement('p');
      const vendorContactLabel = document.createElement('label');
      vendorContactLabel.innerText = "Contact:";
      const vendorContactInput = document.createElement('input');
      vendorContactInput.id = `viewVendorContact${v}`;
      vendorContactInput.value = vendorInfo.getElementsByTagName("ContactInfo")[0].innerHTML;
      vendorContactInput.readOnly = false;
      vendorContactLabel.appendChild(vendorContactInput);
      vendorContactP.appendChild(vendorContactLabel);
      openOnClick.appendChild(vendorContactP);
      viewVendorDiv.appendChild(openOnClick);
    }

    let currentTasks = getTasks(1, thisDate);

    let checkboxes = document.getElementById('checkboxes');
    while (checkboxes.firstChild)
      checkboxes.removeChild(checkboxes.firstChild);

    if (currentTasks !== null) {
      for (let i = 0; i < currentTasks.length; i++) {
        // let eventDateTime = new Date(currentTasks[i].getElementsByTagName("DueDate")[0].innerHTML);
        let eventName = currentTasks[i].getElementsByTagName("EventName")[0].innerHTML;
        let vendor = currentTasks[i].getElementsByTagName("Vendor")[0].innerHTML;
        let taskType = currentTasks[i].getElementsByTagName("TaskType")[0].innerHTML;
        let completed = currentTasks[i].getElementsByTagName("Completed")[0].innerHTML;

        let dueDate = currentTasks[i].getElementsByTagName("dueDate")[0].innerHTML;
        dueDate = new Date(dueDate);

        // dont make a checkbox for balance
        if (taskType != 'Balance') {
          let checkboxInput = document.createElement('input');
          checkboxInput.type = 'checkbox';
          checkboxInput.id = "checkbox" + i;

          // Append checkboxes and their labels
          let checkboxP = document.createElement('p');
          checkboxP.appendChild(checkboxInput);
          let checkboxLabel = document.createElement('label');
          checkboxLabel.htmlFor = "checkbox" + i;

          let checkboxText = taskType + " due " + (dueDate.getMonth() + 1) + "-" + dueDate.getDate() + "-" + dueDate.getFullYear();
          if (vendor != null)
            checkboxText = vendor + " " + checkboxText;

          checkboxLabel.appendChild(document.createTextNode(checkboxText));

          checkboxP.appendChild(checkboxLabel);
          checkboxInput.addEventListener('change', e => {
            updateTaskCheckbox(eventName, vendor, taskType, checkboxLabel, e.target.checked);
          });
          // Show the completed tasks as checked checkboxes
          checkboxInput.checked = (completed == 'true');
          if (checkboxInput.checked)
            checkboxLabel.classList.add("labelChecked");
          else
            checkboxLabel.classList.remove("labelChecked");
          checkboxes.appendChild(checkboxP);
          // setTimeout(()=>{ li.className = 'visual' },5);
        }
      }
    }
    viewEventModal.style.display = 'block';
    newEventModal.style.display = 'none';
    notifModal.style.display = 'none';

  }
  else {
    newEventModal.style.display = 'block';
    viewEventModal.style.display = 'none';
    // Set date input's value to clicked date (in YYYY-MM-DD format)
    eventDateInput.value = thisDate.getFullYear() + '-' + (thisDate.getMonth() + 1).toString().padStart(2, '0') + '-' + thisDate.getDate().toString().padStart(2, '0');
    if (!vendorCount) addVendor(); // Add one vendor by default
  }
  notifModal.style.display = 'none';
}

function openVendor(v){
  // This opens a vendor based on the number v that it is given when creating the div in openModal
  var name = `openOnClickVendor${v}:`;
  let x = document.getElementById(name);
  let vendorNameTitle = document.getElementById(`viewVendorOldName${v}`);

  if (x.style.display === "none") {
    x.style.display = "block";
    vendorNameTitle.classList.add("dropdownActive");
  } else {
    x.style.display = "none";
    vendorNameTitle.classList.remove("dropdownActive");
  }
}

function removeVendor(v){
  // Marks a vendor for removal
  var name = `viewVendorOldName${v}`;
  let x = document.getElementById(name);
  //x.style.setProperty("text-decoration", "line-through");
  
  if (x.dataset.deletion == 'false')
  {
    x.dataset.deletion = 'true';
    //strikethrough
    x.style.setProperty("text-decoration", "line-through");
 
  }
  else 
  {
    x.dataset.deletion = 'false';
    //remove strikethrough
    x.style.textDecoration = 'none';
  }


}

function closeModal() {
  // Remove vendor fields
  vendorCount = 0;
  const eventVendorDiv = document.getElementById('eventVendorDiv');
  while (eventVendorDiv.lastChild)
    eventVendorDiv.removeChild(eventVendorDiv.lastChild);

  // Revert all input fields to default values
  for (e of document.getElementsByTagName("input"))
    e.value = '';

  // Reset error states
  eventTitleInput.classList.remove('error');
  document.getElementById('viewEventTitleInput').classList.remove('error');
  eventDateInput.classList.remove('error');
  viewEventDateInput.classList.remove('error');

  // Hide event sidebars and show notification sidebar
  newEventModal.style.display = 'none';
  viewEventModal.style.display = 'none';
  notifModal.style.display = 'block';
  eventTitleInput.value = '';
  clicked = null;
}

function saveEvent() {
  // Reset error states
  eventTitleInput.classList.remove('error');
  document.getElementById('viewEventTitleInput').classList.remove('error');
  eventDateInput.classList.remove('error');
  viewEventDateInput.classList.remove('error');

  // Stops the user if the title is empty. /^ *$/ is stackoverflow magic that finds all whitespace
  if (/^ *$/.test(eventTitleInput.value)) {
    eventTitleInput.classList.add('error');
    alert("Please enter a name for the event.");
    return;
  }

  let eventDate = new Date(eventDateInput.value);
  eventDate.setUTCHours(6, 0, 0);
  eventDate = eventDate.toISOString();

  //stops the user if they try scheduling an event for a date that's already in use (unless that's the one currently being edited)
  eventDates = Array.from(xmlEvents.getElementsByTagName("eventDateTime"));
  for (i in eventDates) {
    if (eventDates[i].innerHTML == eventDate && clicked.toISOString() != eventDate) {
      eventDateInput.classList.add('error');
      alert("An event is already scheduled for that day. Please choose a different date.");
      return;
    }
  }

  // Make sure balance field isn't negative
  if (eventBalanceDueInput.value < 0)
    eventBalanceDueInput.value = 0;

  // Prep query string
  let phpQuery = 'insert.php?eventDateTime=' + eventDate +
    '&eventType=' + eventTypeInput.value +
    '&eventName=' + eventTitleInput.value +
    '&eventStartTime=' + eventStartTimeInput.value +
    '&eventEndTime=' + eventEndTimeInput.value +
    '&eventClient=' + eventClientInput.value +
    '&balanceDueInCents=' + Math.round(Number(eventBalanceDueInput.value) * 100) +
    '&balancePaidInCents=0' +
    '&numVendors=' + vendorCount;

  // Create array of vendor names for validation purposes
  let vendorNames = [];

  for (v = 1; v <= vendorCount; v++) {
    // Add vendor only if it's not a duplicate and its name isn't blank
    if (!(vendorNames.includes(document.getElementById(`eventVendorName${v}`).value) || /^ *$/.test(document.getElementById(`eventVendorName${v}`).value))) {
      vendorNames.push(document.getElementById(`eventVendorName${v}`).value);
      phpQuery +=
        `&eventVendor${v}=` + document.getElementById(`eventVendorName${v}`).value +
        `&eventVendorContact${v}=` + document.getElementById(`eventVendorContact${v}`).value +
        `&eventVendorType${v}=`;
      // Use custom vendor type if set
      if (document.getElementById(`eventVendorTypeSelect${v}`).value == "Other" && !(/^ *$/.test(document.getElementById(`eventVendorTypeInput${v}`).value)))
        phpQuery += document.getElementById(`eventVendorTypeInput${v}`).value;
      else
        phpQuery += document.getElementById(`eventVendorTypeSelect${v}`).value;
    }
  }

  // PHP query
  let xhr = new XMLHttpRequest();

  // Reload page after post comes back clean
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        loadAll(); // Reload page
        backup(); // Backs up database
      }
      else {
        console.log('Error Code: ' + xhr.status);
        console.log('Error Message: ' + xhr.statusText);
      }
    }
  }

  xhr.open('POST', phpQuery);
  xhr.send();

  closeModal(); // Frontend stuffs

  //  }
  // else {
  //   eventTitleInput.classList.add('error', phpQuery);
  // }
}

function deleteEvent() {

  //backup database
  backup();

  if (confirm("Are you sure you want to delete this event?")) {

    // Prep query string
    let phpQuery = 'delete.php?date=' + clicked.toISOString() + '&name=' + getEvent(clicked).getElementsByTagName('eventName')[0].innerHTML;

    // PHP query
    let xhr = new XMLHttpRequest;

    // Reload page after post comes back clean
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          loadAll(); // Reload page
        }
        else {
          console.log('Error Code: ' + xhr.status);
          console.log('Error Message: ' + xhr.statusText);
        }
      }
    }

    xhr.open('POST', phpQuery);
    xhr.send();

    closeModal(); // Frontend stuffs
  }
}

function editEvent() {
  // Reset error states
  eventTitleInput.classList.remove('error');
  document.getElementById('viewEventTitleInput').classList.remove('error');
  eventDateInput.classList.remove('error');
  viewEventDateInput.classList.remove('error');

  //stops the user if the title is empty. /\s+/g is stackoverflow magic that finds all whitespace
  if (document.getElementById('viewEventTitleInput').value.replace(/\s+/g, '').length == 0) {
    document.getElementById('viewEventTitleInput').classList.add('error');
    alert("Please enter a name for the event.");
    return;
  }

  let newDate = new Date(document.getElementById('viewEventDateInput').value);
  newDate.setUTCHours(6, 0, 0);
  newDate = newDate.toISOString();

  //stops the user if they try scheduling an event for a date that's already in use (unless that's the one currently being edited)
  eventDates = Array.from(xmlEvents.getElementsByTagName("eventDateTime"));
  for (i in eventDates) {
    if (eventDates[i].innerHTML == newDate && clicked.toISOString() != newDate) {
      viewEventDateInput.classList.add('error');
      alert("An event is already scheduled for that day. Please choose a different date.");
      return;
    }
  }

  // Make sure balance fields aren't negative
  if (document.getElementById('viewBalancePaid').value < 0)
    document.getElementById('viewBalancePaid').value = 0;
  if (document.getElementById('viewBalanceDue').value < 0)
    document.getElementById('viewBalanceDue').value = 0;


  // Prep query string
  let phpQuery = 'edit.php?oriDate=' + clicked.toISOString()
    + '&newDate=' + newDate
    + '&newStartTime=' + document.getElementById('viewEventStartTimeInput').value
    + '&newEndTime=' + document.getElementById('viewEventEndTimeInput').value
    + '&name=' + document.getElementById('viewEventTitleInput').value
    + '&type=' + document.getElementById('viewEventTypeInput').value
    + '&client=' + document.getElementById('viewEventClientInput').value
    + '&balancePaid=' + document.getElementById('viewBalancePaid').value * 100
    + '&balanceDue=' + document.getElementById('viewBalanceDue').value * 100
    + '&numVendorsTotal=' + vendorCountEdit;

    for (let i = 1; i <= vendorCountEdit; i++){
        
        if (document.getElementById(`viewVendorNewName${i}`).dataset.newvendor == 'true') {
          phpQuery +=  `&eventVendorOldName${i}=` + document.getElementById(`viewVendorNewName${i}`).value;
        }
        else{
          phpQuery +=  `&eventVendorOldName${i}=` + document.getElementById(`viewVendorOldName${i}`).innerText;
        }

        phpQuery += `&eventVendorNewName${i}=` + document.getElementById(`viewVendorNewName${i}`).value;

        if (document.getElementById(`eventVendorTypeSelect${i}`).value == 'Other'){
          phpQuery += `&eventVendorTypeSelect${i}=` + document.getElementById(`eventVendorTypeInput${i}`).value;
        }
        else{
          phpQuery += `&eventVendorTypeSelect${i}=` + document.getElementById(`eventVendorTypeSelect${i}`).value;
        }
  
        phpQuery += `&eventVendorContact${i}=` + document.getElementById(`viewVendorContact${i}`).value;

        // ViewvendorOldName is null if no vendors exist yet, this prevents the code from running while null
        if(vendorCountEdit -  addVendorCount >= 1){
        phpQuery += `&eventVendorDeletionStatus${i}=` + document.getElementById(`viewVendorOldName${i}`).dataset.deletion; //hardcoded false for now
      }
     
    }

    for (let i = 1; i <= vendorCountEdit - addVendorCount; i++){
    //phpQuery += `&eventVendorDeletionStatus${i}=` + document.getElementById(`viewVendorOldName${i}`).dataset.deletion; 
    }


  // PHP query
  let xhr = new XMLHttpRequest;

  // Reload page after post comes back clean
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200)
        loadAll(); // Reload page
      else {
        console.log('Error Code: ' + xhr.status);
        console.log('Error Message: ' + xhr.statusText);
      }
    }
  }

  xhr.open('POST', phpQuery);
  xhr.send();

  closeModal(); // Frontend stuffs
}

function updateTaskCheckbox(eventName, vendor, taskType, checkboxLabel, comp) {
  if (comp)
    checkboxLabel.classList.add("labelChecked");
  else
    checkboxLabel.classList.remove("labelChecked");

  // Prep query string
  let phpQuery = 'updateTask.php?eventName=' + eventName +
    '&vendor=' + vendor +
    '&taskType=' + taskType +
    '&completed=' + comp;

  // PHP query
  let xhr = new XMLHttpRequest();

  // Reload page after post comes back clean
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200)
        loadXML('loadTasks', function (out) { xmlTasks = out; showNotifications(); load(); }); // Reload tasks
      else {
        console.log('Error Code: ' + xhr.status);
        console.log('Error Message: ' + xhr.statusText);
      }
    }
  }

  xhr.open('POST', phpQuery);
  xhr.send();
  // closeModal(); // Frontend stuffs
}

// Toggle menu visibility when menu button is clicked
function toggleMenu() {
  document.getElementById("controlMenu").classList.toggle("show");
}

// Handles backup
function backup(notifyUser = 0) {

  let xhr = new XMLHttpRequest();

  // Display response when ready
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        if (notifyUser) alert(xhr.responseText);
      }
      else {
        console.log('Error Code: ' + xhr.status);
        console.log('Error Message: ' + xhr.statusText);
      }
    }
  }

  xhr.open('POST', 'backup.php');
  xhr.send();

}

// Close menu if user clicks elsewhere
window.onclick = function (event) {
  if (!event.target.matches('.menuButton')) {
    let dropdowns = document.getElementsByClassName("dropdownMenuContent");
    // Hide all dropdown menus
    for (let i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    if (view == 0)
      firstDay.setDate(firstDay.getDate() + 7);
    else if (view == 1)
      firstDay.setMonth(firstDay.getMonth() + 1);
    else if (view == 2)
      firstDay.setFullYear(firstDay.getFullYear() + 1);
    load('appearLeft 0.25s');
  });

  document.getElementById('backButton').addEventListener('click', () => {
    if (view == 0)
      firstDay.setDate(firstDay.getDate() - 7);
    else if (view == 1)
      firstDay.setMonth(firstDay.getMonth() - 1);
    else if (view == 2)
      firstDay.setFullYear(firstDay.getFullYear() - 1);
    load('appearRight 0.25s');
  });

  document.getElementById('weeklyButton').addEventListener('click', () => {
    if (view == 1) {
      // If current month is selected, select current week
      if (firstDay.getMonth() == new Date().getMonth() && firstDay.getFullYear() == new Date().getFullYear())
        firstDay.setDate(new Date().getDate() - new Date().getDay());
      // Otherwise, set first day of week to Sunday before first day of month
      else
        firstDay.setDate(firstDay.getDate() - firstDay.getDay());
    }
    else if (view == 2)
      // If current year is selected, select current week
      if (firstDay.getFullYear() == new Date().getFullYear())
        firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - new Date().getDay());
      // Otherwise, set first day of week to Sunday before first day of year
      else
        firstDay.setDate(firstDay.getDate() - firstDay.getDay());
    if (view != 0) {
      view = 0; // Set view to weekly
      load('appearUp 0.25s'); // Reload calendar
    }
  });

  document.getElementById('monthlyButton').addEventListener('click', () => {
    if (view == 0) {
      // If current week is selected, select current month
      if (document.getElementById("todayButton") === document.getElementsByClassName("selectedToday")[0])
        firstDay = new Date();
      else {
        // Add 6 to select date of last day of week
        firstDay.setDate(firstDay.getDate() + 6);
      }
      // Month and year are now correct, so set day of month to 1
      firstDay.setDate(1);
    }
    // If current year is selected, select current month
    else if (view == 2 && firstDay.getFullYear() == new Date().getFullYear())
      firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    if (view != 1) {
      view = 1; // Set view to monthly
      load('appearUp 0.25s'); // Reload calendar
    }
  });

  document.getElementById('yearlyButton').addEventListener('click', () => {
    if (view == 0) {
      // If current week is selected, select current year
      if (document.getElementById("todayButton") === document.getElementsByClassName("selectedToday")[0])
        firstDay = new Date();
      else {
        // Add 6 to select date of last day of week
        firstDay.setDate(firstDay.getDate() + 6);
      }
      // Year is now correct, so set month to 0 and day to 1
      firstDay = new Date(firstDay.getFullYear(), 0, 1);
      // Month and year are now correct, so set day of month to 1
      firstDay.setDate(1);
    }
    else if (view == 1) {
      // Set month to 0 (day is already 1)
      firstDay.setMonth(0);
    }
    if (view != 2) {
      view = 2; // Set view to yearly
      load('appearUp 0.25s'); // Reload calendar
    }
  });

  document.getElementById('todayButton').addEventListener('click', () => {
    if (document.getElementById("todayButton") !== document.getElementsByClassName("selectedToday")[0]) {
      // Update firstDay so current view contains today
      if (view == 0)
        firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - new Date().getDay());
      else if (view == 1)
        firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      else if (view == 2)
        firstDay = new Date(new Date().getFullYear(), 0, 1);
      load('appearUp 0.25s'); // Reload calendar
    }
  });

  document.getElementById('showEventsButton').addEventListener('click', () => {
    if (monthViewType != 0) {
      monthViewType = 0; // Set view type to events
      load('appearUp 0.25s'); // Reload calendar
    }
  });

  document.getElementById('showDueDatesButton').addEventListener('click', () => {
    if (monthViewType != 1) {
      monthViewType = 1; // Set view type to due dates
      load('appearUp 0.25s'); // Reload calendar
    }
  });

  document.getElementById('saveButton').addEventListener('click', saveEvent);
  document.getElementById('cancelButton').addEventListener('click', closeModal);
  document.getElementById('deleteButton').addEventListener('click', deleteEvent);
  document.getElementById('editButton').addEventListener('click', editEvent);
  document.getElementById('closeButton').addEventListener('click', closeModal);
}

// Apply appropriate color to selected control buttons
function checkSelectedControls() {
  // Weekly, monthly, and yearly buttons
  document.getElementById('weeklyButton').classList.remove("selectedView");
  document.getElementById('monthlyButton').classList.remove("selectedView");
  document.getElementById('yearlyButton').classList.remove("selectedView");
  if (view == 0)
    document.getElementById('weeklyButton').classList.add("selectedView");
  else if (view == 1)
    document.getElementById('monthlyButton').classList.add("selectedView");
  else if (view == 2)
    document.getElementById('yearlyButton').classList.add("selectedView");

  // Events and due dates buttons
  document.getElementById('showEventsButton').classList.remove("selectedViewTypeEvents");
  document.getElementById('showDueDatesButton').classList.remove("selectedViewTypeDueDates");
  if (monthViewType == 0)
    document.getElementById('showEventsButton').classList.add("selectedViewTypeEvents");
  else if (monthViewType == 1)
    document.getElementById('showDueDatesButton').classList.add("selectedViewTypeDueDates");

  // Today button
  if (view == 0) {
    const lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + 6); // Last day of week
    const daysInMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate(); // Returns number of days in month as integer between 1 and 31
    if (firstDay.getDate() == (new Date().getDate() - new Date().getDay() + daysInMonth) % daysInMonth && (
      (firstDay.getMonth() == new Date().getMonth() && firstDay.getFullYear() == new Date().getFullYear()) ||
      (lastDay.getMonth() == new Date().getMonth() && lastDay.getFullYear() == new Date().getFullYear())))
      document.getElementById('todayButton').classList.add("selectedToday");
    else
      document.getElementById('todayButton').classList.remove("selectedToday");
  }
  else if (view == 1) {
    if (firstDay.getMonth() == new Date().getMonth() && firstDay.getFullYear() == new Date().getFullYear())
      document.getElementById('todayButton').classList.add("selectedToday");
    else
      document.getElementById('todayButton').classList.remove("selectedToday");
  }
  else if (view == 2) {
    if (firstDay.getFullYear() == new Date().getFullYear())
      document.getElementById('todayButton').classList.add("selectedToday");
    else
      document.getElementById('todayButton').classList.remove("selectedToday");
  }
}

window.onresize = function () {
  const weekdayLabels = document.getElementsByClassName("weekdayLabel");

  if (weekdayLabels[0].clientWidth < 40) {
    // Set text of each weekdayLabel div to first letter of weekday
    for (let i = 0; i < 7; ++i)
      weekdayLabels[i].innerHTML = weekdays[i].substring(0, 1);
  }
  else if (weekdayLabels[0].clientWidth < 100) {
    // Set text of each weekdayLabel div to weekday abbreviation
    for (let i = 0; i < 7; ++i)
      weekdayLabels[i].innerHTML = weekdays[i].substring(0, 3);
  }

  else {
    // Set text of each weekdayLabel div to full weekday name
    for (let i = 0; i < 7; ++i)
      weekdayLabels[i].innerHTML = weekdays[i];
  }
}

// Load everything
function loadAll() {
  loadXML('loadTasks', function (out) {
    xmlTasks = out;
    loadXML('loadEvents', function (out) {
      xmlEvents = out; load(); showNotifications();
    });
    loadXML('loadVendors', function (out) { xmlVendors = out; });
    loadXML('loadEventVendors', function (out) { xmlEventVendors = out; });
  });
}

// Sends request to PHP file and returns XML document
// php: name of PHP file, callback: callback function
function loadXML(php, callback) {
  let xhr = new XMLHttpRequest();
  // Display response when ready
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        if (callback) callback(new DOMParser().parseFromString(xhr.responseText, "text/xml"));
      }
      else {
        console.log('Error Code: ' + xhr.status);
        console.log('Error Message: ' + xhr.statusText);
      }
    }
  }
  xhr.open('GET', php + '.php');
  xhr.send();
}

function getEvent(thisDate) {
  if (xmlEvents) {
    // Find event for this day
    let eventForDay;
    let events = xmlEvents.getElementsByTagName("event");
    for (let j = 0; j < events.length; j++) {
      dbDate = new Date(events[j].getElementsByTagName("eventDateTime")[0].innerHTML);

      if (thisDate.toDateString() == dbDate.toDateString()) {
        eventForDay = events[j];
        break; // Stops searching other events
      }
      else {
        eventForDay = null;
      }
    }
    return eventForDay;
  }
}

// Similar to the getEvent function, looks for due dates
// mode: 0 = due, 1 = checkbox
function getTasks(mode, thisDate = null) {
  if (xmlTasks) {
    task = xmlTasks.getElementsByTagName("task");
    let newTasks = [];

    for (let i = 0; i < task.length; i++) {
      if (mode == 0)
        dbDate = new Date(task[i].getElementsByTagName("dueDate")[0].innerHTML);
      else if (mode == 1)
        dbDate = new Date(task[i].getElementsByTagName("eventDateTime")[0].innerHTML);

      if (thisDate === null || thisDate.toDateString() == dbDate.toDateString()) {
        if (mode == 1 || (mode == 0 && task[i].getElementsByTagName("Completed")[0].innerHTML != 'true'))
          newTasks.push(task[i]);
      }
    }

    // Return null if no tasks, otherwise returns tasks
    if (newTasks.length == 0) return null;
    return newTasks;
  }
}

// Show notifications in sidebar
function showNotifications() {
  // Remove all current notifs
  while (notifModalNotifs.firstChild) notifModalNotifs.removeChild(notifModalNotifs.firstChild);

  // Display monthly notifications beginning on the specified date
  const monthlyNotifDate = 15;
  if (new Date().getDate() >= monthlyNotifDate) {
    if (new Date().getMonth() != policeDismissed) {
      const square = document.createElement('div');
      square.classList.add('dueDate', 'notification');
      square.innerText = "Remember to email the police officers!";
      square.addEventListener('click', () => {
        policeDismissed = new Date().getMonth();
        localStorage.setItem('policeDismissed', policeDismissed);
        square.style.display = 'none';
      });
      notifModalNotifs.appendChild(square);
    }
    if (new Date().getMonth() != cleaningStaffDismissed) {
      const square = document.createElement('div');
      square.classList.add('dueDate', 'notification');
      square.innerText = "Remember to email the cleaning staff!";
      square.addEventListener('click', () => {
        cleaningStaffDismissed = new Date().getMonth();
        localStorage.setItem('cleaningStaffDismissed', cleaningStaffDismissed);
        square.style.display = 'none';
      });
      notifModalNotifs.appendChild(square);
    }
  }

  for (let i = 0; getTasks(0) && i < getTasks(0).length; i++) {

    let notification = getTasks(0)[i];
    let today = new Date().toISOString();

    if (today <= notification.getElementsByTagName("eventDateTime")[0].innerHTML) {

      if (notification.getElementsByTagName("Completed")[0].innerHTML != "true") {
        const square = document.createElement('div');
        square.classList.add('dueDate', 'notification');
        let dueDate = new Date(notification.getElementsByTagName("dueDate")[0].innerHTML);
        let taskText = notification.getElementsByTagName("TaskType")[0].innerHTML
          + " due for " + notification.getElementsByTagName("EventName")[0].innerHTML
          + " by " + (dueDate.getMonth() + 1) + "-" + dueDate.getDate() + "-" + dueDate.getFullYear();

        //if (vendor not null)
        let vendor = notification.getElementsByTagName("Vendor")[0].innerHTML;
        if (vendor.length != 0)
          taskText = vendor + " " + taskText;

        square.innerText = taskText;
        //square.innerText = notification.getElementsByTagName("TaskType")[0].innerHTML; //todo: generate proper notif text
        // This shows event details of the notification when clicked
        square.addEventListener('click', () => openModal(new Date(notification.getElementsByTagName("eventDateTime")[0].innerHTML)));
        notifModalNotifs.appendChild(square);
      }
    }

  }
};

function getVendor(vendorName) {
  if (xmlVendors) {
    // Find vendors for this day
    let eventVendor = xmlVendors.getElementsByTagName("vendor");
    for (let i = 0; i < eventVendor.length; i++) {
      if (eventVendor[i].getElementsByTagName("Name")[0].innerHTML == vendorName) {
        return eventVendor[i];
        break; // Stops searching other events
      }
    }
  }
}

function getEventVendors(thisDate) {
  if (xmlEventVendors) {
    // Find event vendors for this day
    let eventVendors = [];
    let vendorForEvent = xmlEventVendors.getElementsByTagName("eVendor");

    for (let i = 0; i < vendorForEvent.length; i++) {
      dbDate = new Date(vendorForEvent[i].getElementsByTagName("eventDateTime")[0].innerHTML);

      if (thisDate.toDateString() == dbDate.toDateString()) {
        eventVendors.push(vendorForEvent[i]);
      }
    }
    return eventVendors;
  }
}

window.onresize();
load('appearDown 0.5s');
loadAll();
initButtons();

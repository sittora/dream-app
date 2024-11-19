class Calendar {
    constructor(input) {
        this.input = input;
        this.wrapper = input.parentElement;
        this.dropdown = this.wrapper.querySelector('.calendar-dropdown');
        this.monthSelect = this.wrapper.querySelector('.month-select');
        this.yearSelect = this.wrapper.querySelector('.year-select');
        this.calendarGrid = this.wrapper.querySelector('.calendar-grid');
        this.toggleButton = this.wrapper.querySelector('.calendar-toggle');
        this.prevButton = this.wrapper.querySelector('#prevMonth');
        this.nextButton = this.wrapper.querySelector('#nextMonth');
        
        this.currentDate = new Date();
        this.selectedDate = null;
        this.isOpen = false;
        
        this.initializeYearOptions();
        this.setupEventListeners();
        this.render();
    }
    
    initializeYearOptions() {
        const currentYear = this.currentDate.getFullYear();
        const startYear = currentYear - 100;
        const endYear = currentYear + 100;
        
        for (let year = startYear; year <= endYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) {
                option.selected = true;
            }
            this.yearSelect.appendChild(option);
        }
    }
    
    setupEventListeners() {
        // Toggle calendar
        this.toggleButton.addEventListener('click', () => this.toggle());
        
        // Month and year selection
        this.monthSelect.addEventListener('change', () => {
            this.currentDate.setMonth(parseInt(this.monthSelect.value));
            this.render();
        });
        
        this.yearSelect.addEventListener('change', () => {
            this.currentDate.setFullYear(parseInt(this.yearSelect.value));
            this.render();
        });
        
        // Navigation buttons
        this.prevButton.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updateSelects();
            this.render();
        });
        
        this.nextButton.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updateSelects();
            this.render();
        });
        
        // Close calendar when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.wrapper.contains(e.target)) {
                this.close();
            }
        });
    }
    
    updateSelects() {
        this.monthSelect.value = this.currentDate.getMonth();
        this.yearSelect.value = this.currentDate.getFullYear();
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.dropdown.classList.add('show');
        this.isOpen = true;
        this.render();
    }
    
    close() {
        this.dropdown.classList.remove('show');
        this.isOpen = false;
    }
    
    render() {
        const month = this.currentDate.getMonth();
        const year = this.currentDate.getFullYear();
        
        // Update select values
        this.monthSelect.value = month;
        this.yearSelect.value = year;
        
        // Clear previous calendar
        this.calendarGrid.innerHTML = '';
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();
        const firstDayIndex = firstDay.getDay();
        
        // Get last days of previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        // Create calendar grid
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'calendar-day other-month';
            day.textContent = prevMonthLastDay - i;
            this.calendarGrid.appendChild(day);
        }
        
        // Current month days
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const today = new Date();
            
            if (day === today.getDate() && 
                month === today.getMonth() && 
                year === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            if (this.selectedDate === currentDateStr) {
                dayElement.classList.add('selected');
            }
            
            dayElement.addEventListener('click', () => {
                this.selectDate(currentDateStr, dayElement);
            });
            
            this.calendarGrid.appendChild(dayElement);
        }
        
        // Next month days
        const remainingDays = 42 - (firstDayIndex + totalDays);
        for (let day = 1; day <= remainingDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = day;
            this.calendarGrid.appendChild(dayElement);
        }
    }
    
    selectDate(dateStr, element) {
        // Remove previous selection
        const prevSelected = this.calendarGrid.querySelector('.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        
        // Add new selection
        element.classList.add('selected');
        this.selectedDate = dateStr;
        
        // Update input value
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        this.input.value = formattedDate;
        
        // Close calendar
        setTimeout(() => this.close(), 200);
    }
}

// Initialize calendars
document.addEventListener('DOMContentLoaded', () => {
    const calendarInputs = document.querySelectorAll('.calendar-input');
    calendarInputs.forEach(input => new Calendar(input));
});

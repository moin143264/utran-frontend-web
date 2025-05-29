// Email validation
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
export const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
};

// Phone number validation (10 digits)
export const isValidPhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
};

// Name validation (2-50 chars, letters, spaces, and hyphens)
export const isValidName = (name) => {
    const nameRegex = /^[a-zA-Z\s-]{2,50}$/;
    return nameRegex.test(name);
};

// Competition name validation (3-100 chars)
export const isValidCompetitionName = (name) => {
    return name && name.length >= 3 && name.length <= 100;
};

// Date validation
export const isValidDate = (date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    return selectedDate instanceof Date && !isNaN(selectedDate) && selectedDate >= today;
};

// Team size validation
export const isValidTeamSize = (size) => {
    const teamSize = parseInt(size);
    return !isNaN(teamSize) && teamSize >= 1 && teamSize <= 50;
};

// Match score validation
export const isValidScore = (score) => {
    const numScore = parseInt(score);
    return !isNaN(numScore) && numScore >= 0 && numScore <= 999;
};

// Time validation (HH:mm format)
export const isValidTime = (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
};

// Venue validation (3-100 chars)
export const isValidVenue = (venue) => {
    return venue && venue.length >= 3 && venue.length <= 100;
};

// Sport type validation
export const isValidSport = (sport) => {
    const validSports = [
        'football',
        'basketball',
        'volleyball',
        'cricket',
        'tennis',
        'badminton',
        'table_tennis',
        'chess'
    ];
    return validSports.includes(sport.toLowerCase());
};

// Tournament format validation
export const isValidFormat = (format) => {
    const validFormats = ['knockout', 'league', 'group'];
    return validFormats.includes(format.toLowerCase());
};

// Registration deadline validation
export const isValidRegistrationDeadline = (deadline, startDate) => {
    const deadlineDate = new Date(deadline);
    const tournamentStart = new Date(startDate);
    const today = new Date();
    return (
        deadlineDate instanceof Date &&
        !isNaN(deadlineDate) &&
        deadlineDate >= today &&
        deadlineDate < tournamentStart
    );
};

// Team name validation
export const isValidTeamName = (name) => {
    return name && name.length >= 3 && name.length <= 50;
};

// Notes/Comments validation
export const isValidNotes = (notes) => {
    return !notes || notes.length <= 500;
};

// Round number validation
export const isValidRound = (round) => {
    const roundNum = parseInt(round);
    return !isNaN(roundNum) && roundNum > 0 && roundNum <= 10;
};

// Match status validation
export const isValidMatchStatus = (status) => {
    const validStatuses = ['scheduled', 'ongoing', 'completed', 'cancelled'];
    return validStatuses.includes(status.toLowerCase());
};

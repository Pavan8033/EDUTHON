const mongoose = require('mongoose');
const User = require('./src/models/User');

const updateUsers = async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect('mongodb+srv://BLACKSQUAD123:Pavan%4012345@blacksquad.1paqsyp.mongodb.net/civic-issues?appName=BLACKSQUAD');
        
        console.log('Updating user emails for hackathon demo...');
        await User.findOneAndUpdate({ role: 'admin' }, { email: 'admin@cityfix.com' });
        await User.findOneAndUpdate({ name: 'Sarah Connor' }, { email: 'citizen@cityfix.com' });
        await User.findOneAndUpdate({ name: 'Field Lead Alpha' }, { email: 'maintenance@cityfix.com' });
        
        console.log('User emails updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateUsers();

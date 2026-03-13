const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Issue = require('./src/models/Issue');

const seedData = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect('mongodb://127.0.0.1:27017/civic-issues', { family: 4 });
        console.log('✅ Connected.');
        await User.deleteMany();
        await Category.deleteMany();
        await Issue.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        console.log('🌱 Planting Master Nodes...');
        // 1. Core Users (Demo Personas)
        const users = await User.insertMany([
            { name: 'Director Admin', email: 'admin@city.gov', password, role: 'admin' },
            { name: 'Sarah Connor', email: 'citizen@example.com', password, role: 'citizen' },
            { name: 'Raj Patel', email: 'raj@example.com', password, role: 'citizen' },
            { name: 'Field Lead Alpha', email: 'alpha@city.gov', password, role: 'maintenance' },
            { name: 'Repair Team Beta', email: 'beta@city.gov', password, role: 'maintenance' },
            { name: 'Ops Crew Gamma', email: 'gamma@city.gov', password, role: 'maintenance' },
        ]);

        const adminId = users[0]._id;
        const citizen1Id = users[1]._id;
        const citizen2Id = users[2]._id;
        const mAlphaId = users[3]._id;
        const mBetaId = users[4]._id;

        console.log('🏗️ Establishing Telemetry Categories...');
        // 2. Classifications
        const categories = await Category.insertMany([
            { name: 'Pothole & Roads', defaultPriority: 'High' },
            { name: 'Sanitation & Garbage', defaultPriority: 'Medium' },
            { name: 'Streetlights & Power', defaultPriority: 'Medium' },
            { name: 'Water & Pipelines', defaultPriority: 'High' },
            { name: 'Public Transport Nodes', defaultPriority: 'Low' },
            { name: 'Structural Hazards', defaultPriority: 'High' }
        ]);

        console.log('📡 Generating Hackathon Map Telemetry (Mumbai Sector)...');
        // 3. Dense Issue Data for Heatmaps (Mumbai Coordinates around 19.x, 72.x)
        const baseLat = 19.0760;
        const baseLng = 72.8777;
        
        const randomCoord = (base, spread) => base + (Math.random() - 0.5) * spread;

        const issues = await Issue.insertMany([
            // NEW REPORTS (Unassigned)
            {
                title: 'Massive Crater on JVLR Link',
                description: 'A 4-foot pothole has opened up in the middle lane, disrupting traffic flow significantly.',
                category: categories[0]._id, priority: 'High', status: 'Submitted',
                location: { lat: 19.1235, lng: 72.8945, address: 'JVLR Link Road, Eastern Suburb' },
                reporter: citizen1Id, createdAt: new Date(Date.now() - 3600000)
            },
            {
                title: 'Overflowing Municipal Dumpster',
                description: 'Hazardous waste accumulation near the public school boundary.',
                category: categories[1]._id, priority: 'Medium', status: 'Under Review',
                location: { lat: 19.0520, lng: 72.8420, address: 'Bandra West, Lane 4' },
                reporter: citizen2Id, createdAt: new Date(Date.now() - 7200000)
            },
            {
                title: 'Fallen High-Tension Wire',
                description: 'Dangerous live wire dangling near the bus stop.',
                category: categories[2]._id, priority: 'High', status: 'Submitted',
                location: { lat: 19.0210, lng: 72.8450, address: 'Dadar Station Road' },
                reporter: citizen1Id, createdAt: new Date(Date.now() - 1800000)
            },

            // ACTIVE WORK (Assigned & In Progress)
            {
                title: 'Burst Water Main Flooding Street',
                description: 'Severe structural rupture of the primary water pipeline. Flooding the intersection.',
                category: categories[3]._id, priority: 'High', status: 'In Progress',
                location: { lat: 19.0880, lng: 72.8550, address: 'Santa Cruz Highway Junction' },
                reporter: citizen2Id, assignedTo: mAlphaId, createdAt: new Date(Date.now() - 86400000)
            },
            {
                title: 'Traffic Signal Outage at Main Junction',
                description: 'All 4 signal lights are dead, causing gridlock.',
                category: categories[2]._id, priority: 'High', status: 'Assigned',
                location: { lat: 19.1110, lng: 72.8880, address: 'Andheri East Intersection' },
                reporter: citizen1Id, assignedTo: mBetaId, createdAt: new Date(Date.now() - 172800000)
            },
            {
                title: 'Cracked Pedestrian Bridge Overpass',
                description: 'Noticeable structural fissure on the eastern stairwell of the overpass.',
                category: categories[5]._id, priority: 'Medium', status: 'In Progress',
                location: { lat: 19.0300, lng: 72.8600, address: 'Sion East Transit Node' },
                reporter: citizen2Id, assignedTo: mAlphaId, createdAt: new Date(Date.now() - 259200000)
            },

            // COMPLETED (Resolved)
            {
                title: 'Cleared Illegal Dumping Site',
                description: 'Massive pile of construction debris blocking the pavement.',
                category: categories[1]._id, priority: 'Medium', status: 'Resolved',
                location: { lat: 19.0600, lng: 72.8300, address: 'Khar West Coastal Road' },
                reporter: citizen1Id, assignedTo: mBetaId, createdAt: new Date(Date.now() - 432000000)
            },
            {
                title: 'Fixed Shattered Bus Stop Glass',
                description: 'Vandalized public transit infrastructure.',
                category: categories[4]._id, priority: 'Low', status: 'Resolved',
                location: { lat: 19.0990, lng: 72.8350, address: 'Juhu Beach Transit Stop' },
                reporter: citizen2Id, assignedTo: mAlphaId, createdAt: new Date(Date.now() - 604800000)
            },

            // HEATMAP CLUSTER (Simulating a clustered problem zone in one neighborhood)
            ...Array.from({ length: 8 }).map((_, i) => ({
                title: `Cluster Pothole Event ${i+1}`,
                description: 'Secondary road damage following monsoon failure.',
                category: categories[0]._id, priority: i % 3 === 0 ? 'High' : 'Medium', status: i % 2 === 0 ? 'Submitted' : 'Assigned',
                location: { lat: 19.0760 + (Math.random() - 0.5) * 0.02, lng: 72.8777 + (Math.random() - 0.5) * 0.02, address: 'Kurla West Industrial Grid' },
                reporter: citizen1Id, assignedTo: i % 2 === 0 ? null : mAlphaId, createdAt: new Date()
            }))
        ]);

        console.log(`✅ System Inject Complete: ${users.length} Users, ${categories.length} Categories, ${issues.length} Data Points.`);
        console.log('----------------------------------------------------');
        console.log('DEMO ACCOUNTS (Password: password123)');
        console.log('- Admin: admin@city.gov');
        console.log('- Citizen: citizen@example.com');
        console.log('- Maintenance: alpha@city.gov');
        console.log('----------------------------------------------------');
        
        process.exit();
    } catch (error) {
        console.error('❌ System Inject Fatality:', error);
        process.exit(1);
    }
};

seedData();

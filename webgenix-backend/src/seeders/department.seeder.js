import Department from '../modules/tickets/models/Department.js';

export const seedDepartments = async () => {
    try {
        const departments = [
            {
                name: 'General Support',
                email: 'support@webgenix.com',
                description: 'General customer support and inquiries'
            },
            {
                name: 'Billing',
                email: 'billing@webgenix.com',
                description: 'Billing, payments, and invoice related issues'
            },
            {
                name: 'Technical Support',
                email: 'tech@webgenix.com',
                description: 'Technical issues, server problems, and service disruptions'
            }
        ];

        for (const dept of departments) {
            const existing = await Department.findOne({ name: dept.name });
            if (!existing) {
                await Department.create(dept);
                console.log(`Created department: ${dept.name}`);
            }
        }

        console.log('Department seeding completed');
        return true;
    } catch (error) {
        console.error('Error seeding departments:', error);
        return false;
    }
};

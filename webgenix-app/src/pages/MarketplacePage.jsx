import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Marketplace from '../components/marketplace/Marketplace';

export default function MarketplacePage() {
    return (
        <DashboardLayout>
            <Marketplace />
        </DashboardLayout>
    );
}

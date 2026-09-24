import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductionLayout from '../layout/ProductionLayout';

// Import Components
import GeneralSettings from './GeneralSettings';
import WorkGroup from './WorkGroup';
import ManageProcess from './ManageProcess';
import ProParameter from './ProParameter';
import ProRawMaterial from './ProRawMaterial';
import ProSemiFinished from './ProSemiFinished';
import ProFinishedGood from '../pages/ProFinishedGood';

// Component Mapping
const componentMap = {
    'General': GeneralSettings,
    'Workgroup': WorkGroup,
    'Manage Process': ManageProcess,
    'Parameter': ProParameter,
    'Raw Materials': ProRawMaterial,
    'Semi Finished': ProSemiFinished,
    'Finished Good': ProFinishedGood,
    'BOM': () => (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-background-muted text-foreground-muted mt-6">
            <h3 className="mt-2 text-lg font-medium text-foreground">Bill of Materials (BOM)</h3>
            <p className="mt-1 text-sm">Manage your product BOMs here.</p>
        </div>
    )
};

const ProductionSettings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'General';

    const handleTabChange = (tabName) => {
        setSearchParams({ tab: tabName });
    };

    const ActiveComponent = componentMap[activeTab] || GeneralSettings;

    return (
        <ProductionLayout activeTab={activeTab} onTabChange={handleTabChange}>
            <ActiveComponent />
        </ProductionLayout>
    );
};

export default ProductionSettings;

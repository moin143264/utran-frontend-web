import React from 'react';
import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Component to conditionally render content based on user role
const RoleBasedView = ({ 
    children, 
    roles, // string or array of roles that can view this content
    fallback = null, // optional component to show if user doesn't have permission
    requireAuth = true // whether authentication is required
}) => {
    const { user, hasRole } = useAuth();

    // If auth is required and user is not logged in, show nothing or fallback
    if (requireAuth && !user) {
        return fallback;
    }

    // If no roles specified, show content to all authenticated users
    if (!roles) {
        return <View>{children}</View>;
    }

    // Check if user has required role
    const hasPermission = hasRole(roles);

    if (!hasPermission) {
        return fallback;
    }

    return <View>{children}</View>;
};

export default RoleBasedView;

/*
Usage example:

<RoleBasedView roles={['admin', 'organizer']}>
    <AdminOnlyFeature />
</RoleBasedView>

<RoleBasedView 
    roles="admin" 
    fallback={<Text>Not authorized</Text>}
>
    <AdminDashboard />
</RoleBasedView>
*/

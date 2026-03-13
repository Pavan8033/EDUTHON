import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const sendOTP = async (phone) => {
        try {
            const { data } = await axios.post('/api/auth/send-otp', { phone });
            return { success: true, message: data.message, otp: data.otp };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to send OTP' };
        }
    };

    const verifyOTP = async (phone, code) => {
        try {
            const { data } = await axios.post('/api/auth/verify-otp', { phone, code });
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Verification failed' };
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (name, email, phone, password, role = 'citizen') => {
        try {
            const { data } = await axios.post('/api/auth/register', { name, email, phone, password, role });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, sendOTP, verifyOTP }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

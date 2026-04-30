import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../services/ticket.service';

export default function CreateTicket() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // In a real app, fetch departments from API. Hardcoded for now.
    const departments = [
        { _id: '662b1f1a1c4b2a1f1a1c4b2a', name: 'General Support' },
        { _id: '662b1f1a1c4b2a1f1a1c4b2b', name: 'Billing' },
        { _id: '662b1f1a1c4b2a1f1a1c4b2c', name: 'Technical Support' }
    ];

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        departmentId: departments[0]._id, // default to first
        priority: 'MEDIUM'
    });

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.subject.trim() || !formData.description.trim()) {
            setError('Subject and description are required.');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            const response = await createTicket(formData);
            const newTicket = response.data?.data;
            if (newTicket?._id) {
                navigate(`/tickets/${newTicket._id}`);
            } else {
                navigate('/tickets');
            }
        } catch (err) {
            console.error('Failed to create ticket:', err);
            setError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-webgenix py-8 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">Create New Ticket</h1>
                <p className="text-text-secondary">Please provide details about your issue so we can help you better.</p>
            </div>

            <form onSubmit={handleSubmit} className="card-webgenix p-6 sm:p-8 space-y-6">
                {error && (
                    <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">Department</label>
                        <select 
                            name="departmentId"
                            value={formData.departmentId}
                            onChange={handleChange}
                            className="input-webgenix"
                            required
                        >
                            {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">Priority</label>
                        <select 
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="input-webgenix"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Subject</label>
                    <input 
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="input-webgenix"
                        placeholder="Brief description of the issue"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Description</label>
                    <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="input-webgenix min-h-[200px]"
                        placeholder="Please provide as much detail as possible..."
                        required
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-dark-700">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)}
                        className="btn-webgenix bg-dark-700 hover:bg-dark-600 text-text-primary"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn-webgenix btn-primary-webgenix min-w-[140px]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                Submitting...
                            </div>
                        ) : 'Create Ticket'}
                    </button>
                </div>
            </form>
        </div>
    );
}

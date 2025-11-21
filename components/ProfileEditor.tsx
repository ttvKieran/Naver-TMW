'use client';

import React, { useState } from 'react';

interface ProfileEditorProps {
    initialData: any;
    onUpdate: (newData: any) => void;
    onClose: () => void;
}

export default function ProfileEditor({ initialData, onUpdate, onClose }: ProfileEditorProps) {
    const [formData, setFormData] = useState(initialData);

    const handleChange = (section: string, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: Number(value)
            }
        }));
    };

    const handleSimpleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
                <div className="p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Basic Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">GPA</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="4.0"
                                    value={formData.gpa}
                                    onChange={(e) => handleSimpleChange('gpa', Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">MBTI</label>
                                <select
                                    value={formData.personality.mbti}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            personality: {
                                                ...prev.personality,
                                                mbti: val
                                            }
                                        }));
                                    }}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                                >
                                    {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Skills (1-10)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(formData.skills).map(([key, value]: [string, any]) => (
                                <div key={key}>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-700 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </label>
                                        <span className="text-sm font-bold text-indigo-600">{value}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={value}
                                        onChange={(e) => handleChange('skills', key, e.target.value)}
                                        className="w-full accent-indigo-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>1</span>
                                        <span>10</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Traits */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Personality Traits (1-10)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(formData.personality.traits).map(([key, value]: [string, any]) => (
                                <div key={key}>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-700 capitalize">
                                            {key}
                                        </label>
                                        <span className="text-sm font-bold text-purple-600">{value}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={value}
                                        onChange={(e) => {
                                            const newVal = Number(e.target.value);
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                personality: {
                                                    ...prev.personality,
                                                    traits: {
                                                        ...prev.personality.traits,
                                                        [key]: newVal
                                                    }
                                                }
                                            }));
                                        }}
                                        className="w-full accent-purple-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>1</span>
                                        <span>10</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 font-bold transform hover:-translate-y-0.5"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

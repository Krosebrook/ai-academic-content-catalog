
import React, { useState, useEffect } from 'react';
import { getPersona, savePersona } from '../../utils/settingsStorage';
import FFCard from './shared/FFCard';
import FFButton from './shared/FFButton';

const SettingsPanel: React.FC = () => {
    const [persona, setPersona] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setPersona(getPersona());
    }, []);

    const handleSave = () => {
        savePersona(persona);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-3xl mx-auto ff-fade-in-up">
            <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)' }} className="mb-6">
                Settings
            </h2>
            <FFCard>
                <h3 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }}>
                    Teaching Persona
                </h3>
                <p className="text-ff-text-secondary mt-2 mb-4">
                    Define your teaching style and persona. This will be provided to the AI as a system instruction for all content generations to ensure the tone and style are consistent with your preferences.
                </p>

                <textarea
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    rows={6}
                    className="w-full bg-ff-surface p-2 rounded-md border border-slate-600"
                    placeholder="e.g., You are a witty high school history teacher who uses modern analogies to explain complex events. Your tone is engaging and slightly informal."
                />

                <div className="mt-4 flex justify-end items-center gap-4">
                    {saved && <span className="text-sm text-green-400">Persona saved!</span>}
                    <FFButton onClick={handleSave} variant="primary">
                        Save Persona
                    </FFButton>
                </div>
            </FFCard>
        </div>
    );
};

export default SettingsPanel;

import React from 'react';

const InputField = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-foreground-muted">{label}</label>
        <input id={props.name} {...props} className="input bg-background-muted border-border text-foreground" />
    </div>
);

export default InputField;

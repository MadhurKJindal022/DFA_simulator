/*import React from "react";

export const Accordion = ({ children }) => {
  return <div className="accordion">{children}</div>;
};

export const AccordionItem = ({ title, children }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="accordion-item">
      <div
        className="accordion-header cursor-pointer font-bold"
        onClick={() => setOpen(!open)}
      >
        {title}
      </div>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
};
*/

import React, { useState } from "react";

export const Accordion = ({ children }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="accordion border rounded divide-y">
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          isOpen: openIndex === index,
          onToggle: () =>
            setOpenIndex(openIndex === index ? null : index),
          index
        })
      )}
    </div>
  );
};

export const AccordionItem = ({ title, children, isOpen, onToggle, index }) => {
  return (
    <div className="accordion-item">
      <button
        onClick={onToggle}
        className="accordion-header w-full text-left px-4 py-3 font-bold bg-gray-100 hover:bg-gray-200 focus:outline-none flex justify-between items-center"
        aria-expanded={isOpen}
        aria-controls={`accordion-body-${index}`}
      >
        {title}
        <span className={`transform transition-transform ${isOpen ? "rotate-90" : ""}`}>
          ▶
        </span>
      </button>

      <div
        id={`accordion-body-${index}`}
        role="region"
        aria-hidden={!isOpen}
        className={`accordion-body px-4 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-40 py-3" : "max-h-0 py-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

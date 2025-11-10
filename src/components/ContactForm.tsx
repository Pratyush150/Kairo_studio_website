/**
 * Contact Form Component
 * Full-featured contact form with 9 fields, validation, and CRM integration
 */

import { useState, FormEvent, ChangeEvent } from 'react';
import { validators, composeValidators, validateFile, validateTotalFilesSize } from '../lib/validation';
import './ContactForm.css';

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  consent: boolean;
  attachments: File[];
}

interface FormErrors {
  [key: string]: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: '',
    budget: '',
    timeline: '',
    message: '',
    consent: false,
    attachments: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate individual files
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setErrors((prev) => ({ ...prev, attachments: validation.error || '' }));
        return;
      }
    }

    // Validate total size
    const totalValidation = validateTotalFilesSize([...formData.attachments, ...files]);
    if (!totalValidation.valid) {
      setErrors((prev) => ({ ...prev, attachments: totalValidation.error || '' }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.attachments;
      return newErrors;
    });
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    const nameError = composeValidators(
      (v) => validators.required(v, 'Name'),
      (v) => validators.minLength(v, 2, 'Name')
    )(formData.name);
    if (nameError) newErrors.name = nameError;

    // Email validation
    const emailError = composeValidators(
      (v) => validators.required(v, 'Email'),
      validators.email
    )(formData.email);
    if (emailError) newErrors.email = emailError;

    // Phone validation (optional)
    if (formData.phone) {
      const phoneError = validators.phone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    // Service validation
    if (!formData.service) {
      newErrors.service = 'Please select a service';
    }

    // Message validation
    const messageError = composeValidators(
      (v) => validators.required(v, 'Message'),
      (v) => validators.minLength(v, 20, 'Message')
    )(formData.message);
    if (messageError) newErrors.message = messageError;

    // Consent validation
    if (!formData.consent) {
      newErrors.consent = 'You must consent to be contacted';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'contact_submit', {
          service: formData.service,
          budget: formData.budget,
          timeline: formData.timeline,
          success: true,
        });
      }

      // TODO: Replace with actual API endpoint
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'attachments') {
          (value as File[]).forEach((file) => {
            formDataToSend.append('attachments', file);
          });
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      // Simulated API call - replace with actual endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          service: '',
          budget: '',
          timeline: '',
          message: '',
          consent: false,
          attachments: [],
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Something went wrong. Please try again or email us directly.' });

      // Analytics error event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'contact_submit', {
          service: formData.service,
          success: false,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="contact-success">
        <div className="success-icon">✓</div>
        <h2>Thank you for reaching out!</h2>
        <p>We've received your message and will respond within 24 hours.</p>
        <p className="success-next-steps">
          Check your email for a confirmation and a link to schedule a call.
        </p>
        <button
          className="success-close-btn"
          onClick={() => setSubmitSuccess(false)}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {/* Name - Required */}
      <div className="form-field">
        <label htmlFor="name" className="form-label">
          Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className={`form-input ${errors.name ? 'error' : ''}`}
          value={formData.name}
          onChange={handleChange}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <span id="name-error" className="form-error" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      {/* Company - Optional */}
      <div className="form-field">
        <label htmlFor="company" className="form-label">
          Company
        </label>
        <input
          type="text"
          id="company"
          name="company"
          className="form-input"
          value={formData.company}
          onChange={handleChange}
        />
      </div>

      {/* Email - Required */}
      <div className="form-field">
        <label htmlFor="email" className="form-label">
          Email <span className="required">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          value={formData.email}
          onChange={handleChange}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" className="form-error" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      {/* Phone - Optional */}
      <div className="form-field">
        <label htmlFor="phone" className="form-label">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className={`form-input ${errors.phone ? 'error' : ''}`}
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 XXX-XXX-XXXX"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && (
          <span id="phone-error" className="form-error" role="alert">
            {errors.phone}
          </span>
        )}
      </div>

      {/* Service - Required */}
      <div className="form-field">
        <label htmlFor="service" className="form-label">
          Service <span className="required">*</span>
        </label>
        <select
          id="service"
          name="service"
          className={`form-select ${errors.service ? 'error' : ''}`}
          value={formData.service}
          onChange={handleChange}
          aria-invalid={!!errors.service}
          aria-describedby={errors.service ? 'service-error' : undefined}
        >
          <option value="">Select a service</option>
          <option value="Complete Digital Product">Complete Digital Product</option>
          <option value="SaaS Platform">SaaS Platform</option>
          <option value="Marketing Automation">Marketing Automation</option>
          <option value="Performance Marketing">Performance Marketing</option>
          <option value="Strategy">Strategy</option>
          <option value="Other">Other</option>
        </select>
        {errors.service && (
          <span id="service-error" className="form-error" role="alert">
            {errors.service}
          </span>
        )}
      </div>

      {/* Budget - Optional */}
      <div className="form-field">
        <label htmlFor="budget" className="form-label">
          Budget
        </label>
        <select
          id="budget"
          name="budget"
          className="form-select"
          value={formData.budget}
          onChange={handleChange}
        >
          <option value="">Select budget range</option>
          <option value="Under ₹5L">Under ₹5L</option>
          <option value="₹5L–₹10L">₹5L–₹10L</option>
          <option value="₹10L–₹25L">₹10L–₹25L</option>
          <option value="₹25L+">₹25L+</option>
        </select>
      </div>

      {/* Timeline - Optional */}
      <div className="form-field">
        <label htmlFor="timeline" className="form-label">
          Timeline
        </label>
        <select
          id="timeline"
          name="timeline"
          className="form-select"
          value={formData.timeline}
          onChange={handleChange}
        >
          <option value="">Select timeline</option>
          <option value="ASAP 1–2 months">ASAP (1–2 months)</option>
          <option value="Soon 3–4 months">Soon (3–4 months)</option>
          <option value="Flexible">Flexible</option>
        </select>
      </div>

      {/* Message - Required */}
      <div className="form-field form-field-full">
        <label htmlFor="message" className="form-label">
          Message <span className="required">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          className={`form-textarea ${errors.message ? 'error' : ''}`}
          value={formData.message}
          onChange={handleChange}
          rows={5}
          placeholder="Tell us about your project..."
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <span id="message-error" className="form-error" role="alert">
            {errors.message}
          </span>
        )}
      </div>

      {/* Attachments - Optional */}
      <div className="form-field form-field-full">
        <label htmlFor="attachments" className="form-label">
          Attachments (optional)
        </label>
        <input
          type="file"
          id="attachments"
          name="attachments"
          className="form-file-input"
          onChange={handleFileChange}
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          aria-describedby="attachments-help"
        />
        <p id="attachments-help" className="form-help">
          Max 10MB total. Accepts PDF, PNG, JPG.
        </p>
        {formData.attachments.length > 0 && (
          <ul className="attachment-list">
            {formData.attachments.map((file, index) => (
              <li key={index} className="attachment-item">
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="attachment-remove"
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {errors.attachments && (
          <span className="form-error" role="alert">
            {errors.attachments}
          </span>
        )}
      </div>

      {/* Consent - Required */}
      <div className="form-field form-field-full">
        <label className="form-checkbox-label">
          <input
            type="checkbox"
            name="consent"
            className="form-checkbox"
            checked={formData.consent}
            onChange={handleChange}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
          />
          <span>
            I consent to Kairo Studio contacting me <span className="required">*</span>
          </span>
        </label>
        {errors.consent && (
          <span id="consent-error" className="form-error" role="alert">
            {errors.consent}
          </span>
        )}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="form-error form-error-submit" role="alert">
          {errors.submit}
        </div>
      )}

      {/* Submit Button */}
      <div className="form-actions">
        <button
          type="submit"
          className="form-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Request'}
        </button>
      </div>

      {/* Footer Info */}
      <div className="form-footer">
        <p className="form-footer-text">
          <strong>Response promise:</strong> We typically reply within 24 hours.
        </p>
        <p className="form-footer-text">
          <small>
            <strong>Privacy:</strong> We keep your data safe. Read our{' '}
            <a href="/privacy" className="form-link">
              privacy policy
            </a>
            .
          </small>
        </p>
      </div>
    </form>
  );
}

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { PersonalDataForm } from '../personal-data-form';

// Mock translations
const messages = {
  guestAnalysis: {
    personalForm: {
      title: 'Fill in Your Personal Information',
      description: 'Please accurately fill in birth information',
      quickFill: 'Quick Fill Sample Data',
      nameRequired: 'Name *',
      namePlaceholder: 'Please enter your name',
      genderRequired: 'Gender *',
      genderPlaceholder: 'Please select gender',
      male: 'Male',
      female: 'Female',
      birthDateRequired: 'Birth Date *',
      birthTime: 'Birth Time',
      birthPlaceRequired: 'Birth Place *',
      birthPlacePlaceholder: 'Please enter birth city',
      nextHouseOrientation: 'Next: House Orientation'
    }
  }
};

describe('PersonalDataForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnQuickFill = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderForm = (props = {}) => {
    return render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <PersonalDataForm
          onSubmit={mockOnSubmit}
          onQuickFill={mockOnQuickFill}
          {...props}
        />
      </NextIntlClientProvider>
    );
  };

  it('renders form with all required fields', () => {
    renderForm();

    expect(screen.getByLabelText(/Name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gender \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Birth Date \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Birth Place \*/i)).toBeInTheDocument();
  });

  it('displays quick fill button', () => {
    renderForm();

    const quickFillButton = screen.getByRole('button', { name: /Quick Fill Sample Data/i });
    expect(quickFillButton).toBeInTheDocument();
  });

  it('calls onQuickFill when quick fill button is clicked', () => {
    renderForm();

    const quickFillButton = screen.getByRole('button', { name: /Quick Fill Sample Data/i });
    fireEvent.click(quickFillButton);

    expect(mockOnQuickFill).toHaveBeenCalledTimes(1);
  });

  it('submits form with valid data', async () => {
    renderForm();

    // Fill in the form
    const nameInput = screen.getByLabelText(/Name \*/i);
    const genderSelect = screen.getByLabelText(/Gender \*/i);
    const birthDateInput = screen.getByLabelText(/Birth Date \*/i);
    const locationInput = screen.getByLabelText(/Birth Place \*/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(genderSelect, { target: { value: 'male' } });
    fireEvent.change(birthDateInput, { target: { value: '1990-05-15' } });
    fireEvent.change(locationInput, { target: { value: 'Beijing' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Next: House Orientation/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        gender: 'male',
        birthDate: '1990-05-15',
        birthTime: '',
        location: 'Beijing'
      });
    });
  });

  it('displays default values when provided', () => {
    const defaultValues = {
      name: 'Jane Smith',
      gender: 'female' as const,
      birthDate: '1985-03-20',
      birthTime: '14:30',
      location: 'Shanghai'
    };

    renderForm({ defaultValues });

    expect(screen.getByLabelText(/Name \*/i)).toHaveValue('Jane Smith');
    expect(screen.getByLabelText(/Gender \*/i)).toHaveValue('female');
    expect(screen.getByLabelText(/Birth Date \*/i)).toHaveValue('1985-03-20');
    expect(screen.getByLabelText(/Birth Place \*/i)).toHaveValue('Shanghai');
  });

  it('has proper accessibility attributes', () => {
    renderForm();

    const nameInput = screen.getByLabelText(/Name \*/i);
    expect(nameInput).toHaveAttribute('aria-required', 'true');
    expect(nameInput).toHaveAttribute('required');

    const quickFillButton = screen.getByRole('button', { name: /Quick Fill Sample Data/i });
    expect(quickFillButton).toHaveAttribute('aria-label');
  });
});

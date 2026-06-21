"use client";

import {
  BUDGET_LABELS,
  COUNTRY_LABELS,
  EFFORT_LABELS,
  GOAL_LABELS,
  HOME_CONTROL_LABELS,
  INPUT_BOUNDS,
} from "@/constants";
import type {
  BudgetSensitivity,
  CarType,
  CountryCode,
  DietType,
  HeatingType,
  HomeControl,
  LifestyleProfile,
  PreferredEffort,
  ReductionGoal,
  ShoppingHabit,
} from "@/domain/types";

type FieldErrors = Readonly<Record<string, string>>;

interface ProfileFormProps {
  readonly profile: LifestyleProfile;
  readonly errors: FieldErrors;
  readonly isSubmitting: boolean;
  readonly onProfileChange: (profile: LifestyleProfile) => void;
  readonly onSubmit: () => void;
}

interface Option<T extends string> {
  readonly value: T;
  readonly label: string;
}

const COUNTRIES = Object.entries(COUNTRY_LABELS).map(([value, label]) => ({
  value: value as CountryCode,
  label,
}));

const GOALS = Object.entries(GOAL_LABELS).map(([value, label]) => ({
  value: value as ReductionGoal,
  label,
}));

const HOME_CONTROLS = Object.entries(HOME_CONTROL_LABELS).map(([value, label]) => ({
  value: value as HomeControl,
  label,
}));

const BUDGETS = Object.entries(BUDGET_LABELS).map(([value, label]) => ({
  value: value as BudgetSensitivity,
  label,
}));

const EFFORTS = Object.entries(EFFORT_LABELS).map(([value, label]) => ({
  value: value as PreferredEffort,
  label,
}));

const HEATING_OPTIONS: readonly Option<HeatingType>[] = [
  { value: "none", label: "No separate heating fuel" },
  { value: "gas", label: "Gas" },
  { value: "oil", label: "Heating oil" },
  { value: "electric", label: "Electric resistance" },
  { value: "heat-pump", label: "Heat pump" },
];

const CAR_OPTIONS: readonly Option<CarType>[] = [
  { value: "none", label: "No car" },
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
];

const DIET_OPTIONS: readonly Option<DietType>[] = [
  { value: "heavy-meat", label: "Heavy meat" },
  { value: "medium-meat", label: "Medium meat" },
  { value: "low-meat", label: "Low meat" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
];

const SHOPPING_OPTIONS: readonly Option<ShoppingHabit>[] = [
  { value: "minimal", label: "Minimal" },
  { value: "average", label: "Average" },
  { value: "frequent", label: "Frequent" },
];

function FieldError({ id, message }: { readonly id: string; readonly message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  error,
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly suffix?: string;
  readonly error?: string;
  readonly onChange: (value: number) => void;
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="mt-1 flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-100">
        <input
          id={id}
          className="min-h-11 w-full rounded-lg px-3 text-base text-slate-950 outline-none"
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
        />
        {suffix ? <span className="pr-3 text-sm font-medium text-slate-500">{suffix}</span> : null}
      </span>
      <FieldError id={`${id}-error`} message={error} />
    </label>
  );
}

function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  error,
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: T;
  readonly options: readonly Option<T>[];
  readonly error?: string;
  readonly onChange: (value: T) => void;
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <select
        id={id}
        className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.currentTarget.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id={`${id}-error`} message={error} />
    </label>
  );
}

function Section({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4 border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
      <legend className="text-base font-bold text-slate-950">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function ProfileForm({
  profile,
  errors,
  isSubmitting,
  onProfileChange,
  onSubmit,
}: ProfileFormProps) {
  const errorEntries = Object.entries(errors);
  const updateProfile = (patch: Partial<LifestyleProfile>) => onProfileChange({ ...profile, ...patch });
  const updateContext = (patch: Partial<LifestyleProfile["context"]>) =>
    onProfileChange({ ...profile, context: { ...profile.context, ...patch } });
  const updateHome = (patch: Partial<LifestyleProfile["home"]>) =>
    onProfileChange({ ...profile, home: { ...profile.home, ...patch } });
  const updateTransport = (patch: Partial<LifestyleProfile["transport"]>) =>
    onProfileChange({ ...profile, transport: { ...profile.transport, ...patch } });
  const updateConsumption = (patch: Partial<LifestyleProfile["consumption"]>) =>
    onProfileChange({ ...profile, consumption: { ...profile.consumption, ...patch } });

  return (
    <form
      className="space-y-6"
      aria-label="Carbon footprint profile"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {errorEntries.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <p className="font-semibold">Check these fields before calculating:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errorEntries.map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Section title="Profile">
        <SelectField
          id="country"
          label="Country"
          value={profile.country}
          options={COUNTRIES}
          error={errors.country}
          onChange={(country) => updateProfile({ country })}
        />
        <NumberField
          id="householdSize"
          label="Household size"
          min={INPUT_BOUNDS.householdSize.min}
          max={INPUT_BOUNDS.householdSize.max}
          value={profile.householdSize}
          error={errors.householdSize}
          onChange={(householdSize) => updateProfile({ householdSize })}
        />
        <SelectField
          id="reductionGoal"
          label="Main goal"
          value={profile.context.reductionGoal}
          options={GOALS}
          error={errors["context.reductionGoal"]}
          onChange={(reductionGoal) => updateContext({ reductionGoal })}
        />
        <SelectField
          id="preferredEffort"
          label="Preferred effort"
          value={profile.context.preferredEffort}
          options={EFFORTS}
          error={errors["context.preferredEffort"]}
          onChange={(preferredEffort) => updateContext({ preferredEffort })}
        />
        <SelectField
          id="homeControl"
          label="Home control"
          value={profile.context.homeControl}
          options={HOME_CONTROLS}
          error={errors["context.homeControl"]}
          onChange={(homeControl) => updateContext({ homeControl })}
        />
        <SelectField
          id="budgetSensitivity"
          label="Budget"
          value={profile.context.budgetSensitivity}
          options={BUDGETS}
          error={errors["context.budgetSensitivity"]}
          onChange={(budgetSensitivity) => updateContext({ budgetSensitivity })}
        />
      </Section>

      <Section title="Home energy">
        <NumberField
          id="electricityKwhPerMonth"
          label="Electricity"
          min={INPUT_BOUNDS.electricityKwhPerMonth.min}
          max={INPUT_BOUNDS.electricityKwhPerMonth.max}
          value={profile.home.electricityKwhPerMonth}
          suffix="kWh/month"
          error={errors["home.electricityKwhPerMonth"]}
          onChange={(electricityKwhPerMonth) => updateHome({ electricityKwhPerMonth })}
        />
        <NumberField
          id="renewableShare"
          label="Renewable share"
          min={0}
          max={100}
          value={Math.round(profile.home.renewableShare * 100)}
          suffix="%"
          error={errors["home.renewableShare"]}
          onChange={(value) => updateHome({ renewableShare: value / 100 })}
        />
        <SelectField
          id="heating"
          label="Heating type"
          value={profile.home.heating}
          options={HEATING_OPTIONS}
          error={errors["home.heating"]}
          onChange={(heating) => updateHome({ heating })}
        />
        <NumberField
          id="heatingFuelKwhPerMonth"
          label="Heating fuel"
          min={INPUT_BOUNDS.heatingFuelKwhPerMonth.min}
          max={INPUT_BOUNDS.heatingFuelKwhPerMonth.max}
          value={profile.home.heatingFuelKwhPerMonth}
          suffix="kWh/month"
          error={errors["home.heatingFuelKwhPerMonth"]}
          onChange={(heatingFuelKwhPerMonth) => updateHome({ heatingFuelKwhPerMonth })}
        />
      </Section>

      <Section title="Transport">
        <SelectField
          id="carType"
          label="Car type"
          value={profile.transport.carType}
          options={CAR_OPTIONS}
          error={errors["transport.carType"]}
          onChange={(carType) => updateTransport({ carType })}
        />
        <NumberField
          id="carKmPerWeek"
          label="Car travel"
          min={INPUT_BOUNDS.carKmPerWeek.min}
          max={INPUT_BOUNDS.carKmPerWeek.max}
          value={profile.transport.carKmPerWeek}
          suffix="km/week"
          error={errors["transport.carKmPerWeek"]}
          onChange={(carKmPerWeek) => updateTransport({ carKmPerWeek })}
        />
        <NumberField
          id="publicTransitKmPerWeek"
          label="Public transport"
          min={INPUT_BOUNDS.publicTransitKmPerWeek.min}
          max={INPUT_BOUNDS.publicTransitKmPerWeek.max}
          value={profile.transport.publicTransitKmPerWeek}
          suffix="km/week"
          error={errors["transport.publicTransitKmPerWeek"]}
          onChange={(publicTransitKmPerWeek) => updateTransport({ publicTransitKmPerWeek })}
        />
        <NumberField
          id="shortFlightsPerYear"
          label="Short flights"
          min={INPUT_BOUNDS.shortFlightsPerYear.min}
          max={INPUT_BOUNDS.shortFlightsPerYear.max}
          value={profile.transport.shortFlightsPerYear}
          suffix="/year"
          error={errors["transport.shortFlightsPerYear"]}
          onChange={(shortFlightsPerYear) => updateTransport({ shortFlightsPerYear })}
        />
        <NumberField
          id="longFlightsPerYear"
          label="Long flights"
          min={INPUT_BOUNDS.longFlightsPerYear.min}
          max={INPUT_BOUNDS.longFlightsPerYear.max}
          value={profile.transport.longFlightsPerYear}
          suffix="/year"
          error={errors["transport.longFlightsPerYear"]}
          onChange={(longFlightsPerYear) => updateTransport({ longFlightsPerYear })}
        />
      </Section>

      <Section title="Food and shopping">
        <SelectField
          id="diet"
          label="Diet pattern"
          value={profile.diet}
          options={DIET_OPTIONS}
          error={errors.diet}
          onChange={(diet) => updateProfile({ diet })}
        />
        <SelectField
          id="shopping"
          label="Shopping habit"
          value={profile.consumption.shopping}
          options={SHOPPING_OPTIONS}
          error={errors["consumption.shopping"]}
          onChange={(shopping) => updateConsumption({ shopping })}
        />
        <label className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 sm:col-span-2">
          <input
            className="h-4 w-4 accent-emerald-700"
            type="checkbox"
            checked={profile.consumption.recycles}
            onChange={(event) => updateConsumption({ recycles: event.currentTarget.checked })}
          />
          I already recycle regularly
        </label>
      </Section>

      <button
        className="min-h-12 w-full rounded-lg bg-emerald-800 px-5 text-base font-bold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-400"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Calculating..." : "Update carbon plan"}
      </button>
    </form>
  );
}

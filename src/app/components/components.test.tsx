import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CarbonCoachApp } from "@/app/components/carbon-coach-app";
import { FootprintChart } from "@/app/components/footprint-chart";
import { Methodology } from "@/app/components/methodology";
import { ProfileForm } from "@/app/components/profile-form";
import { RecommendationList } from "@/app/components/recommendation-list";
import { ResultsDashboard } from "@/app/components/results-dashboard";
import { TrackerPanel } from "@/app/components/tracker-panel";
import { analyzeProfile } from "@/domain/coach";
import { DEFAULT_PROFILE, HIGH_CARBON_PROFILE } from "@/domain/sample-profiles";

describe("ProfileForm", () => {
  it("renders labelled inputs and submits", async () => {
    const user = userEvent.setup();
    const onProfileChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ProfileForm
        profile={DEFAULT_PROFILE}
        errors={{}}
        isSubmitting={false}
        onProfileChange={onProfileChange}
        onSubmit={onSubmit}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Country"), "US");
    await user.click(screen.getByRole("button", { name: "Update carbon plan" }));

    expect(onProfileChange).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("has no axe violations in the default state", async () => {
    const { container } = render(
      <ProfileForm
        profile={DEFAULT_PROFILE}
        errors={{}}
        isSubmitting={false}
        onProfileChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("has no axe violations while showing field errors", async () => {
    const { container } = render(
      <ProfileForm
        profile={DEFAULT_PROFILE}
        errors={{ householdSize: "Household size must be at least 1." }}
        isSubmitting={false}
        onProfileChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});

describe("results components", () => {
  const analysis = analyzeProfile(HIGH_CARBON_PROFILE);

  it("renders the benchmark dashboard and methodology notes", () => {
    render(
      <>
        <ResultsDashboard analysis={analysis} />
        <Methodology />
      </>,
    );

    expect(screen.getByText("Your annual estimate")).toBeInTheDocument();
    expect(screen.getByText("Benchmark")).toBeInTheDocument();
    expect(screen.getByText("Methodology notes")).toBeInTheDocument();
  });

  it("renders an accessible category chart", () => {
    render(<FootprintChart footprint={analysis.footprint} />);

    expect(screen.getByRole("img", { name: /Carbon footprint category chart/ })).toBeInTheDocument();
    expect(screen.getByText("Flights")).toBeInTheDocument();
  });

  it("renders personalized recommendations and toggles tracking", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<RecommendationList recommendations={analysis.recommendations} adoptedIds={[]} onToggle={onToggle} />);

    expect(screen.getByText("Personalized action plan")).toBeInTheDocument();
    expect(screen.getAllByText(/long-haul/i).length).toBeGreaterThan(0);

    const firstTrackButton = screen.getAllByRole("button", { name: "Track" }).at(0);
    if (!firstTrackButton) throw new Error("Expected at least one track button");

    await user.click(firstTrackButton);

    expect(onToggle).toHaveBeenCalledWith(analysis.recommendations[0]?.id);
  });

  it("summarizes adopted action savings", () => {
    const adoptedIds = [analysis.recommendations[0]?.id].filter((id): id is string => Boolean(id));

    render(<TrackerPanel analysis={analysis} adoptedIds={adoptedIds} />);

    expect(screen.getByText("Tracked progress")).toBeInTheDocument();
    expect(screen.getByText("Actions adopted")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("has no axe violations for recommendation cards", async () => {
    const { container } = render(
      <RecommendationList recommendations={analysis.recommendations} adoptedIds={[]} onToggle={vi.fn()} />,
    );

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});

describe("CarbonCoachApp", () => {
  it("submits locally and updates status", async () => {
    const user = userEvent.setup();

    render(<CarbonCoachApp />);
    await user.click(screen.getByRole("button", { name: "Update carbon plan" }));

    expect(screen.getByText("Plan updated locally.")).toBeInTheDocument();
    expect(screen.getByText(analyzeProfile(DEFAULT_PROFILE).insight)).toBeInTheDocument();
  });

  it("blocks submission and shows field errors for invalid input", async () => {
    const user = userEvent.setup();

    render(<CarbonCoachApp />);
    const household = screen.getByLabelText("Household size");
    await user.clear(household);
    await user.type(household, "0");
    await user.click(screen.getByRole("button", { name: "Update carbon plan" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText("Please fix the highlighted fields before calculating."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Plan updated locally.")).not.toBeInTheDocument();
  });
});

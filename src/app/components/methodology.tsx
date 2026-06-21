export function Methodology() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5" aria-labelledby="methodology-heading">
      <h2 id="methodology-heading" className="text-lg font-black text-slate-950">
        Methodology notes
      </h2>
      <div className="mt-3 grid gap-4 text-sm leading-6 text-slate-700 md:grid-cols-2">
        <p>
          CarbonCoach uses rounded public emission factors for awareness: country grid intensity, UK government
          conversion factors for fuels and travel, dietary footprint studies, and shopping-intensity estimates.
        </p>
        <p>
          Results are annual personal estimates in kg CO2e. They are useful for prioritising everyday action, not for
          certified carbon accounting or offset claims.
        </p>
      </div>
    </section>
  );
}

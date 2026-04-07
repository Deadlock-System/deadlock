import FilterOptions from '../FilterOptions';

export default function Filter() {
  return (
    <div className="mb-5 flex flex-row-reverse gap-5.5">
      <div
        className="flex justify-center items-center border-solid border rounded-3xl border-slate-500
   "
      >
        <FilterOptions
          options={['Mais recentes', 'Ativos', 'Não respondidos']}
        />
      </div>
    </div>
  );
}

import Image from "next/image";

import { siteConfig } from "../config/site";

export default function BoardSection() {
  const members = siteConfig.sections.board.members as unknown as {
    name: string;
    role: string;
    company: string;
    photo: string;
  }[];

  return (
    <section id="comision" className="bg-white py-16 md:py-20">
      <div className="container">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-primary-600">
              Comisión directiva
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              Liderazgo institucional
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              {siteConfig.sections.board.description}
            </p>
          </div>
        </div>

        {members.length > 0 ? (
          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 px-5 py-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)] md:px-7 md:py-8">
            <div className="flex gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {members.map((member) => (
                <article
                  key={`${member.role}-${member.name}`}
                  className="w-[200px] shrink-0 rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]"
                >
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={440}
                      height={440}
                      className="h-44 w-full object-cover"
                    />
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-[10px] font-bold uppercase text-primary-600">
                      {member.role}
                    </p>
                    <p className="mt-2.5 text-base font-bold text-slate-900">
                      {member.name}
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">
                      {member.company}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}


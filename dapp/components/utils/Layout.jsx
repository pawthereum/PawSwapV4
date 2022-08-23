import NextHead from 'next/head';
// components
import MenuTop from './MenuTop';

export default function Layout({children}) {
  // @ts-ignore
  const pageName = {pageName: children?.type?.name};

  return (
    <>
      <NextHead>
        <title>PawSwap - {pageName.pageName}</title>
      </NextHead>
      <div className="h-full brand-backdrop min-h-screen relative flex flex-col app-bg">
        <div className="h-full grow flex flex-col">
          <MenuTop />
          <div className="z-10">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
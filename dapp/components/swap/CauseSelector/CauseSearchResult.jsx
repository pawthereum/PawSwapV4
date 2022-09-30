import { useContext, memo } from "react";
import { Facebook, Instagram, Twitter, Globe } from "react-feather";
import placeholder from '../../../public/img/placeholder.jpeg';
// Context
import SwapContext from '../../../context/SwapContext';

export const CauseSearchResult = memo(({ results }) => {
  const { updateCause } = useContext(SwapContext);

  const selectCause = (c) => {
    updateCause(c);
  }

  const CauseImage = ({ img }) => {
    if (!img) return (
      <img
        src={placeholder}
        height={55}
        width={50}
      />
    )
    return (
      <img
        src={img}
        height={50}
        width={50}
      />
    )
  }

  CauseSearchResult.displayName = "CauseSearchResult";

  if (!results) return (
    <div>Loading...</div>
  )

  return (
    <div>
      {
        results.map((r) => (
          <div 
            key={r?.address}
            className={`mt-4 pt-2 pb-0 cursor-pointer rounded-xl ${ r.isFeatured ? 'shadow' : 'hover:shadow'}`}
          >
            { r.isFeatured && (
              <div className="bg-gradient-to-r from-primary to-accent via-secondary text-primary-content rounded-t-xl p-1 mb-2">
                <div className="font-bold text-center text-sm">✨ Featured Cause ✨</div>
              </div>
            )}
            <div 
              className="flex items-start w-full px-4" 
              onClick={() => selectCause(r)}
              htmlFor="cause-selector"
            >
              <div className="avatar mr-2">
                <div className="w-12 rounded-full">
                  <CauseImage img={r?.logo || r?.icon} />
                </div>
              </div>
              <div className="collapse grow" style={{ width: '100%' }}>
                <input type="checkbox" className="peer" /> 
                <div className="collapse-title pt-0 pr-0">
                  <div className="text-lg max-w-[70%]">{r?.name}</div>
                  <div className="badge badge-secondary badge-outline badge-sm">{r?.category}</div>
                </div>
                <label htmlFor="cause-selector" key={r?.address} className="shrink text-right">
                  <div className="btn btn-sm btn-secondary ml-2 z-50 absolute top-0 right-0" onClick={() => selectCause(r)}>Select</div>
                </label>
                <div className="collapse-content mb-4 peer-checked:bg-neutral peer-checked:text-neutral-content rounded-md shadow-inner text-xs"> 
                  <div className="mt-4 max-h-24 overflow-y-scroll">{r?.mission}</div>
                  { r?.stats?.map((s, i) => (
                    <div className="mt-2" key={i}>{s}</div>
                  ))}
                  {
                    !r?.facebook ? <></> :
                    <a target="_blank" href={r?.facebook} rel="noopener noreferrer">
                      <button className="btn btn-xs btn-circle btn-ghost mt-4 mx-1">
                        <Facebook className="h-4 w-4" />
                      </button>
                    </a>
                  }
                  {
                    !r?.instagram ? <></> :
                    <a target="_blank" href={r?.instagram} rel="noopener noreferrer">
                      <button className="btn btn-xs btn-circle btn-ghost mt-4 mx-1">
                        <Instagram className="h-4 w-4" />
                      </button>
                    </a>
                  }
                  {
                    !r?.twitter ? <></> :
                    <a target="_blank" href={r?.twitter} rel="noopener noreferrer">
                      <button className="btn btn-xs btn-circle btn-ghost mt-4 mx-1">
                        <Twitter className="h-4 w-4" />
                      </button>
                    </a>
                  }
                  {
                    !r?.website ? <></> :
                    <a target="_blank" href={r?.website} rel="noopener noreferrer">
                      <button className="btn btn-xs btn-circle btn-ghost mt-4 mx-1">
                        <Globe className="h-4 w-4" />
                      </button>
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  )
});

export default CauseSearchResult;
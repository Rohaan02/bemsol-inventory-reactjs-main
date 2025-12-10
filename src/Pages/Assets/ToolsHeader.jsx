import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@radix-ui/themes";
import { toast } from "react-toastify";

const ToolsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center h-full">
      <div className="flex w-full flex-col gap-3">
        <div className="w-full">
          <div className="flex w-full items-center justify-between flex-wrap sm:flex-nowrap">
            {/* Left Section - Title and Learn Button */}
            <div className="my-3 mr-6 sm:my-0 flex items-center overflow-hidden sm:w-0 sm:flex-1">
              <h1 className="font-sans m-0 font-semibold text-2xl truncate">
                <div className="flex w-full">
                  <div className="ml-4 first:ml-0">Tools</div>
                  <div className="ml-4 first:ml-0">
                    <button 
                      className="bg-gray-25 p-3 pl-4 pr-5 rounded-full dark:bg-gray-900 transition-all duration-200 ease-in-out"
                      data-testid="overview-open"
                    >
                      <div className="flex w-full items-center">
                        <div className="ml-3 flex items-center first:ml-0">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            fill="currentColor" 
                            viewBox="0 0 24 24" 
                            className="text-gray-400"
                          >
                            <path 
                              fill="" 
                              fillRule="evenodd" 
                              d="M13 3a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0zm5.707 3.707 1-1a1 1 0 0 0-1.414-1.414l-1 1a1 1 0 0 0 1.414 1.414M12 9a3 3 0 0 0-3 3c0 .621.212 1.088.596 1.815l.073.136c.289.543.637 1.198.904 2.049h2.854c.267-.85.615-1.506.904-2.049l.073-.136C14.788 13.088 15 12.62 15 12a3 3 0 0 0-3-3m-1.041 9q.04.47.041 1a1 1 0 1 0 2 0q0-.53.041-1H10.96zM7 12a5 5 0 0 1 10 0c0 1.16-.438 2.012-.829 2.75l-.06.116h-.001c-.372.7-.728 1.37-.935 2.343A8.5 8.5 0 0 0 15 19a3 3 0 1 1-6 0c0-.71-.069-1.296-.175-1.791-.207-.972-.563-1.642-.935-2.343l-.061-.115C7.438 14.01 7 13.159 7 12m-4-1a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2zm17 0a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2zM4.293 4.293a1 1 0 0 1 1.414 0l1 1a1 1 0 0 1-1.414 1.414l-1-1a1 1 0 0 1 0-1.414" 
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3 flex items-center first:ml-0">
                          <div className="opacity-100 text-sm font-normal text-gray-600 dark:text-gray-400 transition-all duration-500 ease-in-out">
                            Learn
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </h1>
            </div>

            {/* Right Section - Progress, Stats, and Actions */}
            <div className="flex-none my-4 sm:my-0">
              <div className="flex w-full items-center">
                {/* Progress Bar and Stats */}
                <div className="ml-4 flex items-center first:ml-0">
                  <div className="flex">
                    <div className="flex w-full items-center">
                      <div className="ml-5 flex items-center first:ml-0">
                        <div className="w-24">
                          <div 
                            className="bg-gray-100 rounded spark-progress w-full overflow-hidden" 
                            data-testid="progress-bar"
                          >
                            <div 
                              className="inline-block leading-none text-center text-white bg-yellow-300 h-4 rounded" 
                              style={{ width: 'max(8px, 89.6%)' }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="ml-5 flex items-center first:ml-0">
                        <p 
                          data-testid="stat_info_text" 
                          className="break-words max-w-full text-md text-primary text-left font-normal normal-case font-sans m-0"
                        >
                          448 of 500
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* More Options Button */}
                <div className="ml-4 flex items-center first:ml-0">
                  <div className="flex">
                    <Button
                      variant="outline"
                      className="leading-normal inline-flex items-center font-normal h-8 text-md px-4 bg-fill-primary border border-primary border-solid text-primary hover:text-primary hover:bg-fill-primary-hover active:bg-fill-primary-active focus-visible:bg-fill-primary-hover rounded-md whitespace-nowrap"
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded="false"
                      data-state="closed"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          fill="" 
                          fillRule="evenodd" 
                          d="M6 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4m8-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0m6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0" 
                          clipRule="evenodd"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>

                {/* Add Tool Button */}
                <div className="ml-4 flex items-center first:ml-0">
                  <div className="flex">
                    <Button
                      onClick={() => navigate("/27091d7ee5/equipment/new")}
                      className="leading-normal inline-flex items-center font-normal h-8 text-md px-4 bg-fill-brand border-0 text-brand-on-bg-fill hover:text-brand-on-bg-fill hover:bg-fill-brand-hover active:bg-fill-brand-active focus-visible:bg-fill-brand-hover rounded-md"
                    >
                      <span className="flex items-center overflow-hidden">
                        <span className="mr-0 md:mr-3">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="18" 
                            height="18" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              fill="" 
                              d="M13 4a1 1 0 1 0-2 0v7H4a1 1 0 1 0 0 2h7v7a1 1 0 1 0 2 0v-7h7a1 1 0 1 0 0-2h-7z"
                            />
                          </svg>
                        </span>
                        <span className="w-0 invisible md:w-auto md:visible overflow-hidden">
                          Add Tool
                        </span>
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsHeader;
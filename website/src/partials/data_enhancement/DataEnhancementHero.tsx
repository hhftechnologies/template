import React from "react";

import { useColorMode } from "@docusaurus/theme-common";

import { Hero } from "../general/Hero";
import { CTAButtonMixin } from "../utils";
import { TwoColumns } from "../general/TwoColumns";

export function DataEnhancementHero() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return <TwoColumns
        left={
            <div>

                <h1 className="text-4xl tracking-tight font-extrabold md:text-6xl">
                    <span className="block">OpenAI</span>
                    <span
                        className="block text-primary">Integration</span>
                </h1>
                <div className="mt-3 text-xl sm:mt-4 md:text-2xl">
                    <p>
                        Our CMS with OpenAI integration offers a powerful
                        autofill
                        feature that can save you time and increase the accuracy
                        of
                        your data entry.
                    </p>
                    <p>
                        Sign up now and experience the power of OpenAI to
                        enhance
                        your data entry and streamline your business processes.
                    </p>
                </div>

                <div
                    className="mt-5 sm:mt-8">
                    <a href="mailto:hello@firecms.co?subject=FireCMS%20consulting"
                       rel="noopener noreferrer"
                       target="_blank"
                       className={CTAButtonMixin}>
                        Get started
                    </a>
                </div>
            </div>
        }
        right={<>

            <div
                style={{
                    aspectRatio: 550 / 750,
                    maxHeight: "750px",
                    maxWidth: "550px"
                }}
                data-aos="fade-up"
                className={" flex content-center justify-center"}>
                <video
                    className={"rounded-xl border border-solid dark:border-gray-800 border-gray-200"}
                    width="100%"
                    loop autoPlay muted>
                    <source
                        src={isDarkTheme ? "/img/data/data_enhancement_dark.mp4" : "/img/data/data_enhancement_light.mp4"}
                        type="video/mp4"/>
                </video>
            </div>


        </>}/>;
}
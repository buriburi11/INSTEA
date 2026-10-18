// =============
//    IMPORTS
// =============

import Header from "./Header";
import Footer from "./Footer";
import "./PageLayout.css";

// ============
//  COMPONENT
// ============

function PageLayout({ children }) {                                                                     // This component is used to wrap the main content of the page with a header and footer.
    return(                                                                                             // It takes in a single prop, children, which represents the content to be displayed in the main section of the page.
        <div className="page-layout">                                                                   {/* Usage is <PageLayout>           */}
            <Header />                                                                                  {/*             <menu-page />       */}
                <main className="page-layout-main" id = "main-content">                                 {/*         </PageLayout>           */}
                    <div className="page-layout-container">
                        {children}
                    </div>
                </main>
            <Footer />
        </div>
    );
}

export default PageLayout;
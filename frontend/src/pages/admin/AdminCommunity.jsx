import PollManagement from "../../components/admin/community/PollManagement";
import AnnouncementManagement from "../../components/admin/community/AnnouncementManagement";
import "./AdminCommunity.css";

export default function AdminCommunity() {
    return (
        <section className="admin-community">

            {/* Admin Community page title */}
            <h1 className="admin-community-title">
                Community
            </h1>

            {/* Poll Management */}
            <PollManagement />

            {/* Announcement Management */}
            <AnnouncementManagement />

        </section>
    );
}
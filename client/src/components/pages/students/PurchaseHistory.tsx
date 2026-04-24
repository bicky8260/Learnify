import TopBar from "../../lazy/TopBar";
import MyCourses from "../../ui/Courses/MyCourses";

export default function PurchaseHistory() {
  return (
    <div className="w-full min-h-screen bg-background">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Courses
          </h1>
          <p className="text-muted-foreground">
            View all courses you are enrolled in.
          </p>
        </div>

        <MyCourses />
      </div>
    </div>
  );
}

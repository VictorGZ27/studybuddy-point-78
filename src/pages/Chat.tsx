import { Navbar } from "@/components/Navbar";
import AIChat from "@/components/AIChat";

const Chat = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 h-[calc(100vh-4rem)]">
        <AIChat />
      </main>
    </div>
  );
};

export default Chat;
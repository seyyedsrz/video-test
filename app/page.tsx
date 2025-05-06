import  VideoPlayer from "@/components/VideoPlayer";
 

export default function Home() {
  return (
    <main className="p-6">
     <VideoPlayer src="http://localhost:3001/master.m3u8" />
    </main>
  );
}

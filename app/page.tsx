import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      {/* 左サイド */}
      <div className="flex-1 border-r-2 border-gray-300"></div>
      
      {/* メイン画面（中央） */}
      <div className="flex-1 flex flex-col items-center border-r-2 border-gray-300 py-8">
        {/* タイトル */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-cyan-400">ワタルート</span>
            <span className="text-pink-400">オンライン</span>
          </h1>
        </div>
        
        {/* 18x18の盤面 */}
        <div className="grid grid-cols-18 gap-0 border-2 border-gray-400">
          {Array.from({ length: 18 * 18 }).map((_, index) => (
            <div
              key={index}
              className="w-6 h-6 bg-black border border-gray-600"
            ></div>
          ))}
        </div>
      </div>
      
      {/* 右サイド */}
      <div className="flex-1"></div>
    </div>
  );
}

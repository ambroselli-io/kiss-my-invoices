import packageJson from "../../../package.json";

function Open() {
  return (
    <div className="flex h-full w-full flex-col bg-lime-200">
      <div className="my-12 flex items-center justify-between px-12">
        <h1 className="text-3xl font-bold">Open 👐</h1>
      </div>
      <div className="flex-col grow bg-white border-y-2 p-12 flex items-start gap-3 justify-start">
        <p>2023-03-04 - Here is some data I want to share with you:</p>
        <ul className="list-inside list-disc">
          <li>Hours worked: 36.5 hours</li>
          <li>Costs: 3.650€</li>
          <li>Unique visits of this test page according to plausible.io: 19</li>
          <li>Visites to download page: 4</li>
          <li>Turnover: 0€ (payments not available yet 🥸)</li>
          <li>
            Profit: <span className="text-red-500">-3.650€</span>
          </li>
          <li>
            My psychological state: I do like what I created, I will definitely use it for my own. But I don't know if I
            will be the only one... or not! Anyway, I'm happy I did it.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Open;

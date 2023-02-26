function Download() {
  return (
    <div className="flex h-full w-full flex-col bg-rose-500">
      <div className="my-12 flex items-center justify-between px-12">
        <h1 className="text-3xl font-bold text-white">Download 💾</h1>
      </div>
      <div className="flex-col grow bg-white border-y-2 p-12 flex items-start gap-12 justify-start">
        <p>What killer features do you have in the app you are going to download?</p>
        <ul className="list-inside list-disc">
          <li>You own your data: everything is on your computer, and only on your computer.</li>
          <li>Automatic prefill and customise the email you send to your client. Two clicks and it's sent! 🖱️</li>
          <li>Add a BCC field if you want to also send the invoice to your accountant or accounting software 🧾</li>
          <li>
            [VERY SOON]: if your root folder is a Git folder, all your data will be automatically saved on your git
            repo. You own your data! Well, github does... but hey! 🤩
          </li>
        </ul>
        <a
          className="rounded bg-gray-800 py-2 px-12 text-gray-50 mx-auto"
          href="https://github.com/ambroselli-io/kiss-my-invoices/releases/latest"
          target="_blank"
          rel="noreferrer"
        >
          Download
        </a>
      </div>
    </div>
  );
}

export default Download;

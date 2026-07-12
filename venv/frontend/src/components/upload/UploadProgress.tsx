export default function UploadProgress() {
    return (
        <div className="bg-white rounded-xl p-5 shadow">

            <h2 className="text-xl font-semibold">

                Upload Status

            </h2>

            <div className="mt-5 w-full bg-slate-200 rounded-full h-4">

                <div className="bg-green-600 h-4 rounded-full w-0"></div>

            </div>

            <p className="mt-4">

                Waiting for upload...

            </p>

        </div>
    );
}
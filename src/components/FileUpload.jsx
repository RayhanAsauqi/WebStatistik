import { useState } from "react";
import * as XLSX from "xlsx";

const FileUpload = () => {
  const [data, setData] = useState([]);
  const [statistics, setStatistics] = useState({
    averageScore: 0,
    averageReadingTime: 0,
    wordsPerMinute: 0,
    readingAbilityPercentage: 0,
    comprehensionAbility: 0,
  });
  const [wordsInReading, setWordsInReading] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [uploadStatus, setUploadStatus] = useState(false);
  const [isWordsInReadingFilled, setIsWordsInReadingFilled] = useState(false);
  const [updateButtonVisible, setUpdateButtonVisible] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = XLSX.utils.sheet_to_json(wb.Sheets[wsname], { header: 1 });
      processData(ws);
    };
    reader.readAsBinaryString(file);
    setFileUploaded(true);
    setFileName(file.name);
    setFileInputKey(Date.now());
    setUploadStatus(true);
    setUpdateButtonVisible(true);
  };

  const handleUpdateFile = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = XLSX.utils.sheet_to_json(wb.Sheets[wsname], { header: 1 });
      processData(ws);
    };
    reader.readAsBinaryString(file);
    setFileName(file.name);
    setFileInputKey(Date.now());
  };

  const processData = (data) => {
    if (!data || data.length === 0) {
      resetData();
      return;
    }

    const rows = data.slice(1);
    const processedData = rows.map((row) => ({
      username: row[5],
      score: parseFloat(row[2]),
      readingTime: parseFloat(row[11]),
    }));

    const filteredData = processedData.filter(
      (item) => !isNaN(item.score) && !isNaN(item.readingTime)
    );

    if (filteredData.length === 0) {
      resetData();
      return;
    }

    const totalScore = filteredData.reduce((sum, item) => sum + item.score, 0);
    const averageScore = totalScore / filteredData.length;

    const totalReadingTime = filteredData.reduce(
      (sum, item) => sum + item.readingTime,
      0
    );
    const averageReadingTime = totalReadingTime / filteredData.length;

    const wordsPerMinute = wordsInReading
      ? wordsInReading / averageReadingTime
      : 0;

    const readingAbilityPercentage = (averageScore / 100) * 100;

    const comprehensionAbility =
      wordsPerMinute * (100 / readingAbilityPercentage);

    setStatistics({
      averageScore,
      averageReadingTime,
      wordsPerMinute,
      readingAbilityPercentage,
      comprehensionAbility,
    });

    setData(filteredData);
  };

  const resetData = () => {
    setData([]);
    setStatistics({
      averageScore: 0,
      averageReadingTime: 0,
      wordsPerMinute: 0,
      readingAbilityPercentage: 0,
      comprehensionAbility: 0,
    });
    setUploadStatus(false);
  };

  const handleWordsInReadingChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      setWordsInReading(value);
      setIsWordsInReadingFilled(true);
      updateStatistics();
    } else {
      setIsWordsInReadingFilled(false);
    }
  };

  const updateStatistics = () => {
    const wordsPerMinute = wordsInReading
      ? wordsInReading / statistics.averageReadingTime
      : 0;

    const comprehensionAbility =
      wordsPerMinute * (100 / statistics.readingAbilityPercentage);

    setStatistics((prevStats) => ({
      ...prevStats,
      wordsPerMinute,
      comprehensionAbility,
    }));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = XLSX.utils.sheet_to_json(wb.Sheets[wsname], { header: 1 });
      processData(ws);
    };
    reader.readAsBinaryString(file);
    setFileUploaded(true);
    setFileName(file.name);
    setFileInputKey(Date.now());
    setUploadStatus(true);
    setUpdateButtonVisible(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Upload File dan Proses Data</h1>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
        {/* Bagian Input Jumlah Kata dan Input File */}
        <div>
          <div className="my-8">
            <label
              htmlFor="wordsInReading"
              className="block text-lg font-medium mb-2"
            >
              Jumlah Kata dalam Bacaan:
            </label>
            <input
              type="number"
              id="wordsInReading"
              value={wordsInReading || ""}
              onChange={handleWordsInReadingChange}
              className="border border-gray-300 px-4 py-2 w-full"
            />
          </div>
  
          <div
            className="flex items-center justify-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <label
              htmlFor="dropzone-file"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                uploadStatus ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Drag and drop</span> or{" "}
                  <span className="font-semibold">click to upload</span>
                </p>
                <p className="text-xs text-gray-500">CSV, XLSX, or XLS files</p>
              </div>
              <input
                key={fileInputKey}
                id="dropzone-file"
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={!isWordsInReadingFilled}
              />
            </label>
          </div>
  
          {updateButtonVisible && (
            <div className="mt-4">
              <label
                htmlFor="updateFile"
                className="block text-lg font-medium cursor-pointer text-blue-600"
              >
                Update File
              </label>
              <input
                key={fileInputKey}
                id="updateFile"
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleUpdateFile}
                className="hidden"
              />
            </div>
          )}
        </div>
  
        {/* Bagian Statistik */}
        <div className="md:col-span-1">
          <div className="border border-gray-300 p-4 rounded-md mb-8">
            <h2 className="text-xl font-bold mb-2">Statistik:</h2>
            {fileUploaded && (
              <p className="text-sm text-gray-500">
                File yang diunggah: {fileName}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-lg font-medium mb-2">Rata-rata Skor:</p>
                <p className="text-xl font-semibold">
                  {statistics.averageScore.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-lg font-medium mb-2">
                  Rata-rata Waktu Membaca:
                </p>
                <p className="text-xl font-semibold">
                  {statistics.averageReadingTime.toFixed(2)} menit
                </p>
              </div>
              <div>
                <p className="text-lg font-medium mb-2">Kecepatan Membaca:</p>
                <p className="text-xl font-semibold">
                  {statistics.wordsPerMinute.toFixed(2)} KPM
                </p>
              </div>
              <div>
                <p className="text-lg font-medium mb-2">
                  Persentase Kemampuan Membaca:
                </p>
                <p className="text-xl font-semibold">
                  {statistics.readingAbilityPercentage.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-lg font-medium mb-2">
                  Kemampuan Membaca Pemahaman:
                </p>
                <p className="text-xl font-semibold">
                  {statistics.comprehensionAbility.toFixed(2)} KPM
                </p>
              </div>
            </div>
          </div>
        </div>
  
        {/* Bagian Tabel Data yang Diunggah */}
        <div className="md:col-span-2">
          {fileUploaded && data.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Data yang Diunggah:</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Username
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Score
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Reading Time (minutes)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.readingTime.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  
  
};

export default FileUpload;

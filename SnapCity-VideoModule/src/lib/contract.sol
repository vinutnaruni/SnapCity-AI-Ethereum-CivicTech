// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PotholeDetection {
    struct Detection {
        string videoName;
        string videoPath;
        uint256 detectionCount;
        uint256 confidenceAvg; // Stored as percentage (0-100)
        string locationName;
        int256 locationLat; // Stored as integer (multiply by 1000000)
        int256 locationLng; // Stored as integer (multiply by 1000000)
        uint8 status; // 0: pending, 1: validated, 2: rejected
        uint256 timestamp;
        address submitter;
        string validationNotes;
        address validator;
    }

    Detection[] public detections;
    mapping(address => bool) public admins;
    address public owner;

    event DetectionAdded(uint256 indexed detectionId, address indexed submitter);
    event DetectionValidated(uint256 indexed detectionId, bool isValid, address indexed validator);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner, "Only admin can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }

    function addAdmin(address _admin) external onlyOwner {
        admins[_admin] = true;
    }

    function removeAdmin(address _admin) external onlyOwner {
        admins[_admin] = false;
    }

    function addDetection(
        string memory _videoName,
        string memory _videoPath,
        uint256 _detectionCount,
        uint256 _confidenceAvg,
        string memory _locationName,
        int256 _locationLat,
        int256 _locationLng
    ) external {
        Detection memory newDetection = Detection({
            videoName: _videoName,
            videoPath: _videoPath,
            detectionCount: _detectionCount,
            confidenceAvg: _confidenceAvg,
            locationName: _locationName,
            locationLat: _locationLat,
            locationLng: _locationLng,
            status: 0, // pending
            timestamp: block.timestamp,
            submitter: msg.sender,
            validationNotes: "",
            validator: address(0)
        });

        detections.push(newDetection);
        emit DetectionAdded(detections.length - 1, msg.sender);
    }

    function validateDetection(
        uint256 _detectionId,
        bool _isValid,
        string memory _notes
    ) external onlyAdmin {
        require(_detectionId < detections.length, "Detection does not exist");
        require(detections[_detectionId].status == 0, "Detection already validated");

        detections[_detectionId].status = _isValid ? 1 : 2;
        detections[_detectionId].validationNotes = _notes;
        detections[_detectionId].validator = msg.sender;

        emit DetectionValidated(_detectionId, _isValid, msg.sender);
    }

    function getDetectionCount() external view returns (uint256) {
        return detections.length;
    }

    function getDetection(uint256 _detectionId) external view returns (
        string memory videoName,
        string memory videoPath,
        uint256 detectionCount,
        uint256 confidenceAvg,
        string memory locationName,
        int256 locationLat,
        int256 locationLng,
        uint8 status,
        uint256 timestamp,
        address submitter
    ) {
        require(_detectionId < detections.length, "Detection does not exist");
        Detection memory detection = detections[_detectionId];
        
        return (
            detection.videoName,
            detection.videoPath,
            detection.detectionCount,
            detection.confidenceAvg,
            detection.locationName,
            detection.locationLat,
            detection.locationLng,
            detection.status,
            detection.timestamp,
            detection.submitter
        );
    }

    function getAllDetections() external view returns (Detection[] memory) {
        return detections;
    }

    function getPendingDetections() external view returns (Detection[] memory) {
        uint256 pendingCount = 0;
        for (uint256 i = 0; i < detections.length; i++) {
            if (detections[i].status == 0) {
                pendingCount++;
            }
        }

        Detection[] memory pendingDetections = new Detection[](pendingCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < detections.length; i++) {
            if (detections[i].status == 0) {
                pendingDetections[currentIndex] = detections[i];
                currentIndex++;
            }
        }

        return pendingDetections;
    }
}